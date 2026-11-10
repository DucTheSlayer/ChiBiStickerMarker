package com.chibistudio.app;

import android.os.Bundle;

import com.chibistudio.app.stickers.StickerExportPlugin;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(StickerExportPlugin.class); // plugin nội bộ, phải đăng ký trước super.onCreate
        super.onCreate(savedInstanceState);
    }
}
