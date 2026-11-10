package com.chibistudio.app.stickers;

import android.content.Context;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Lưu pack đã xuất trong filesDir/wa_stickers/&lt;id&gt;/ để StickerContentProvider phục vụ cho WhatsApp.
 * Mọi tên (id, file) đều được kiểm tra chặt để chống path traversal.
 */
public final class StickerPackStore {
    private static final Pattern SAFE = Pattern.compile("^[A-Za-z0-9_.-]{1,128}$");
    public static final String TRAY_FILE = "tray.png";
    private static final String META_FILE = "pack.json";

    private StickerPackStore() {}

    public static boolean isSafeName(String s) {
        return s != null && SAFE.matcher(s).matches() && !s.equals(".") && !s.equals("..");
    }

    public static File root(Context ctx) {
        File r = new File(ctx.getFilesDir(), "wa_stickers");
        if (!r.exists()) r.mkdirs();
        return r;
    }

    public static File packDir(Context ctx, String id) {
        if (!isSafeName(id)) return null;
        return new File(root(ctx), id);
    }

    /** Một sticker: tên file + danh sách emoji (1–3). */
    public static final class Sticker {
        public final String file;
        public final List<String> emojis;
        public Sticker(String file, List<String> emojis) { this.file = file; this.emojis = emojis; }
    }

    public static final class Pack {
        public String id;
        public String name;
        public String publisher;
        public String version;
        public List<Sticker> stickers = new ArrayList<>();
    }

    public static void save(Context ctx, Pack pack, byte[] tray, List<byte[]> webps) throws IOException, JSONException {
        File dir = packDir(ctx, pack.id);
        if (dir == null) throw new IOException("Unsafe pack identifier");
        deleteRecursive(dir);
        if (!dir.mkdirs()) throw new IOException("Cannot create pack dir");
        write(new File(dir, TRAY_FILE), tray);
        for (int i = 0; i < webps.size(); i++) write(new File(dir, pack.stickers.get(i).file), webps.get(i));

        JSONObject o = new JSONObject();
        o.put("id", pack.id).put("name", pack.name).put("publisher", pack.publisher).put("version", pack.version);
        JSONArray arr = new JSONArray();
        for (Sticker s : pack.stickers) {
            arr.put(new JSONObject().put("file", s.file).put("emojis", new JSONArray(s.emojis)));
        }
        o.put("stickers", arr);
        write(new File(dir, META_FILE), o.toString().getBytes("UTF-8"));
    }

    public static List<Pack> list(Context ctx) {
        List<Pack> out = new ArrayList<>();
        File[] dirs = root(ctx).listFiles();
        if (dirs == null) return out;
        for (File d : dirs) {
            Pack p = read(ctx, d.getName());
            if (p != null) out.add(p);
        }
        return out;
    }

    public static Pack read(Context ctx, String id) {
        File dir = packDir(ctx, id);
        if (dir == null) return null;
        File meta = new File(dir, META_FILE);
        if (!meta.isFile()) return null;
        try {
            JSONObject o = new JSONObject(new String(readAll(meta), "UTF-8"));
            Pack p = new Pack();
            p.id = o.getString("id");
            p.name = o.getString("name");
            p.publisher = o.getString("publisher");
            p.version = o.optString("version", "1");
            JSONArray arr = o.getJSONArray("stickers");
            for (int i = 0; i < arr.length(); i++) {
                JSONObject s = arr.getJSONObject(i);
                List<String> emojis = new ArrayList<>();
                JSONArray ea = s.getJSONArray("emojis");
                for (int j = 0; j < ea.length(); j++) emojis.add(ea.getString(j));
                p.stickers.add(new Sticker(s.getString("file"), emojis));
            }
            return p;
        } catch (IOException | JSONException e) {
            return null;
        }
    }

    /** Trả file asset nếu hợp lệ (tray hoặc sticker của pack), ngược lại null. */
    public static File asset(Context ctx, String id, String fileName) {
        if (!isSafeName(id) || !isSafeName(fileName)) return null;
        File f = new File(new File(root(ctx), id), fileName);
        return f.isFile() ? f : null;
    }

    private static void write(File f, byte[] data) throws IOException {
        try (FileOutputStream out = new FileOutputStream(f)) { out.write(data); }
    }

    private static byte[] readAll(File f) throws IOException {
        try (java.io.FileInputStream in = new java.io.FileInputStream(f)) {
            java.io.ByteArrayOutputStream bos = new java.io.ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) > 0) bos.write(buf, 0, n);
            return bos.toByteArray();
        }
    }

    private static void deleteRecursive(File f) {
        File[] kids = f.listFiles();
        if (kids != null) for (File k : kids) deleteRecursive(k);
        //noinspection ResultOfMethodCallIgnored
        f.delete();
    }
}
