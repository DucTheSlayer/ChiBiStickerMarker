package com.chibistudio.app.stickers;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.content.Context;
import android.content.UriMatcher;
import android.content.res.AssetFileDescriptor;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.Collections;
import java.util.List;

/**
 * Phục vụ pack sticker cho WhatsApp theo hợp đồng "WhatsApp Stickers API":
 *   /metadata, /metadata/{id}, /stickers/{id}, /stickers_asset/{id}/{file}
 */
public class StickerContentProvider extends ContentProvider {
    public static final String METADATA = "metadata";
    public static final String STICKERS = "stickers";
    public static final String STICKERS_ASSET = "stickers_asset";

    private static final int CODE_METADATA_ALL = 1;
    private static final int CODE_METADATA_ONE = 2;
    private static final int CODE_STICKERS = 3;
    private static final int CODE_ASSET = 4;

    private UriMatcher matcher;
    private String authority;

    public static String authority(Context ctx) {
        return ctx.getPackageName() + ".stickercontentprovider";
    }

    @Override
    public boolean onCreate() {
        authority = authority(getContext());
        matcher = new UriMatcher(UriMatcher.NO_MATCH);
        matcher.addURI(authority, METADATA, CODE_METADATA_ALL);
        matcher.addURI(authority, METADATA + "/*", CODE_METADATA_ONE);
        matcher.addURI(authority, STICKERS + "/*", CODE_STICKERS);
        matcher.addURI(authority, STICKERS_ASSET + "/*/*", CODE_ASSET);
        return true;
    }

    @Nullable
    @Override
    public Cursor query(@NonNull Uri uri, String[] projection, String selection, String[] selectionArgs, String sortOrder) {
        Context ctx = getContext();
        if (ctx == null) return null;
        switch (matcher.match(uri)) {
            case CODE_METADATA_ALL:
                return metadata(ctx, StickerPackStore.list(ctx));
            case CODE_METADATA_ONE: {
                StickerPackStore.Pack p = StickerPackStore.read(ctx, uri.getLastPathSegment());
                return metadata(ctx, p == null ? Collections.<StickerPackStore.Pack>emptyList() : Collections.singletonList(p));
            }
            case CODE_STICKERS:
                return stickers(ctx, uri.getLastPathSegment());
            default:
                throw new IllegalArgumentException("Unknown URI: " + uri);
        }
    }

    private Cursor metadata(Context ctx, List<StickerPackStore.Pack> packs) {
        MatrixCursor c = new MatrixCursor(new String[]{
                "sticker_pack_identifier", "sticker_pack_name", "sticker_pack_publisher", "sticker_pack_icon",
                "android_play_store_link", "ios_app_download_link", "sticker_pack_publisher_email",
                "sticker_pack_publisher_website", "sticker_pack_privacy_policy_website",
                "sticker_pack_license_agreement_website", "image_data_version", "whatsapp_will_not_cache_stickers",
                "animated_sticker_pack"});
        for (StickerPackStore.Pack p : packs) {
            c.addRow(new Object[]{p.id, p.name, p.publisher, StickerPackStore.TRAY_FILE,
                    "", "", "", "", "", "", p.version, 0, 0});
        }
        c.setNotificationUri(ctx.getContentResolver(), Uri.parse("content://" + authority + "/" + METADATA));
        return c;
    }

    private Cursor stickers(Context ctx, String id) {
        MatrixCursor c = new MatrixCursor(new String[]{"sticker_file_name", "sticker_emoji", "sticker_accessibility_text"});
        StickerPackStore.Pack p = StickerPackStore.read(ctx, id);
        if (p != null) {
            for (StickerPackStore.Sticker s : p.stickers) {
                c.addRow(new Object[]{s.file, android.text.TextUtils.join(",", s.emojis), p.name});
            }
        }
        c.setNotificationUri(ctx.getContentResolver(), Uri.parse("content://" + authority + "/" + STICKERS + "/" + id));
        return c;
    }

    @Nullable
    @Override
    public AssetFileDescriptor openAssetFile(@NonNull Uri uri, @NonNull String mode) throws FileNotFoundException {
        if (matcher.match(uri) != CODE_ASSET) throw new FileNotFoundException("Unsupported URI: " + uri);
        List<String> seg = uri.getPathSegments();
        File f = StickerPackStore.asset(getContext(), seg.get(1), seg.get(2));
        if (f == null) throw new FileNotFoundException("No such asset: " + uri);
        return new AssetFileDescriptor(ParcelFileDescriptor.open(f, ParcelFileDescriptor.MODE_READ_ONLY), 0, AssetFileDescriptor.UNKNOWN_LENGTH);
    }

    @Nullable
    @Override
    public String getType(@NonNull Uri uri) {
        switch (matcher.match(uri)) {
            case CODE_METADATA_ALL: return "vnd.android.cursor.dir/vnd." + authority + "." + METADATA;
            case CODE_METADATA_ONE: return "vnd.android.cursor.item/vnd." + authority + "." + METADATA;
            case CODE_STICKERS: return "vnd.android.cursor.dir/vnd." + authority + "." + STICKERS;
            case CODE_ASSET: {
                String last = uri.getLastPathSegment();
                return last != null && last.endsWith(".png") ? "image/png" : "image/webp";
            }
            default: throw new IllegalArgumentException("Unknown URI: " + uri);
        }
    }

    // Provider chỉ đọc.
    @Nullable @Override public Uri insert(@NonNull Uri uri, ContentValues values) { throw new UnsupportedOperationException(); }
    @Override public int delete(@NonNull Uri uri, String selection, String[] selectionArgs) { throw new UnsupportedOperationException(); }
    @Override public int update(@NonNull Uri uri, ContentValues values, String selection, String[] selectionArgs) { throw new UnsupportedOperationException(); }
}
