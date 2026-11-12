package study.learnlang.app;

import com.getcapacitor.BridgeActivity;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(new NotificationChannel("learnlang_calls_v1", "Incoming calls", NotificationManager.IMPORTANCE_HIGH));
            manager.createNotificationChannel(new NotificationChannel("learnlang_messages_v1", "Messages", NotificationManager.IMPORTANCE_DEFAULT));
            manager.createNotificationChannel(new NotificationChannel("learnlang_updates_v1", "Activity updates", NotificationManager.IMPORTANCE_DEFAULT));
        }
    }
}
