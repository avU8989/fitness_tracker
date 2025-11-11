package com.anonymous.frontend

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class AndroidBondingPackage : ReactPackage{
    //tell react which modules we want to expose to JS
    override fun createNativeModules(reactContext : ReactApplicationContext): List<NativeModule>{
        return listOf(AndroidBondingModule(reactContext))
    }

    override fun createViewManagers(reactContext : ReactApplicationContext): List<ViewManager<*, *>>{
        return emptyList()
    }
}