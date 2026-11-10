package com.chibistudio.app.stickers;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.util.Base64;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/** Cầu nối JS ↔ native: ghi pack vào kho và mở WhatsApp để xác nhận thêm. */
@CapacitorPlugin(name = "StickerExport")
public class StickerExportPlugin extends Plugin {
    private static final String WA = "com.whatsapp";
    private static final String WA_BUSINESS = "com.whatsapp.w4b";
    private static final String ACTION = "com.whatsapp.intent.action.ENABLE_STICKER_PACK";
    private static final int MAX_BYTES_STICKER = 100 * 1024;
    private static final int MAX_BYTES_TRAY = 50 * 1024;

    private boolean installed(String pkg) {
        try {
            getContext().getPackageManager().getPackageInfo(pkg, 0);
            return true;
        } catch (PackageManager.NameNotFoundException e) {
            return false;
        }
    }

    @PluginMethod
    public void isWhatsAppInstalled(PluginCall call) {
        JSObject r = new JSObject();
        r.put("consumer", installed(WA));
        r.put("business", installed(WA_BUSINESS));
        call.resolve(r);
    }

    @PluginMethod
    public void addPack(PluginCall call) {
        try {
            String id = call.getString("identifier");
            String name = call.getString("name");
            String publisher = call.getString("publisher");
            String trayB64 = call.getString("trayPngBase64");
            JSArray stickers = call.getArray("stickers");
            boolean business = Boolean.TRUE.equals(call.getBoolean("business", false));

            if (!StickerPackStore.isSafeName(id)) { call.reject("Invalid identifier"); return; }
            if (name == null || name.trim().isEmpty() || name.length() > 128) { call.reject("Invalid name"); return; }
            if (publisher == null || publisher.trim().isEmpty() || publisher.length() > 128) { call.reject("Invalid publisher"); return; }
            if (trayB64 == null || stickers == null) { call.reject("Missing data"); return; }
            int n = stickers.length();
            if (n < 3 || n > 30) { call.reject("A pack needs 3–30 stickers"); return; }

            byte[] tray = Base64.decode(trayB64, Base64.DEFAULT);
            if (tray.length > MAX_BYTES_TRAY) { call.reject("Tray icon larger than 50 KB"); return; }

            StickerPackStore.Pack pack = new StickerPackStore.Pack();
            pack.id = id;
            pack.name = name.trim();
            pack.publisher = publisher.trim();
            pack.version = String.valueOf(System.currentTimeMillis());
            List<byte[]> files = new ArrayList<>();
            for (int i = 0; i < n; i++) {
                JSONObject s = stickers.getJSONObject(i);
                byte[] webp = Base64.decode(s.getString("webpBase64"), Base64.DEFAULT);
                if (webp.length > MAX_BYTES_STICKER) { call.reject("Sticker " + (i + 1) + " larger than 100 KB"); return; }
                JSONArray ea = s.optJSONArray("emojis");
                List<String> emojis = new ArrayList<>();
                if (ea != null) for (int j = 0; j < ea.length() && j < 3; j++) emojis.add(ea.getString(j));
                if (emojis.isEmpty()) emojis.add("🙂");
                pack.stickers.add(new StickerPackStore.Sticker((i + 1) + ".webp", emojis));
                files.add(webp);
            }
            StickerPackStore.save(getContext(), pack, tray, files);

            String waPackage = business ? WA_BUSINESS : WA;
            if (!installed(waPackage)) { call.reject("WhatsApp is not installed"); return; }

            Intent intent = new Intent();
            intent.setAction(ACTION);
            intent.setPackage(waPackage);
            intent.putExtra("sticker_pack_id", pack.id);
            intent.putExtra("sticker_pack_authority", StickerContentProvider.authority(getContext()));
            intent.putExtra("sticker_pack_name", pack.name);
            getActivity().startActivity(intent);

            JSObject r = new JSObject();
            r.put("started", true);
            call.resolve(r);
        } catch (Exception e) {
            call.reject("Export failed: " + e.getMessage(), e);
        }
    }
}
