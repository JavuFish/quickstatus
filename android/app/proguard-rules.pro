# Keep Capacitor core classes
-keep class com.getcapacitor.** { *; }
-dontwarn com.getcapacitor.**

# Keep Cordova plugin classes
-keep class org.apache.cordova.** { *; }
-dontwarn org.apache.cordova.**

# Keep Google services (Firebase, Play Services)
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# Keep JSON parsing (Gson, etc.)
-keep class com.google.gson.** { *; }
-dontwarn com.google.gson.**

# Keep AndroidX classes used by Capacitor
-keep class androidx.** { *; }
-dontwarn androidx.**

# Keep Kotlin metadata
-keep class kotlin.Metadata { *; }

# Keep classes with @Keep annotation
-keep @androidx.annotation.Keep class * { *; }

# Keep all native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# General rules to avoid stripping reflection-based code
-keepclassmembers class * {
    @androidx.annotation.Keep *;
}
