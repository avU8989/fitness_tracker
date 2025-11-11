package com.anonymous.frontend


import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothManager
import android.content.Context

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
//https://stuff.mit.edu/afs/sipb/project/android/docs/reference/android/bluetooth/BluetoothAdapter.html

//React Native Modules need a package class that registers this module 

class AndroidBondingModule(reactContext : ReactApplicationContext):
    ReactContextBaseJavaModule(reactContext) {

        //tells the react native bridge which name should be used to acces this native module
        override fun getName() = "AndroidBonding"

        @ReactMethod
        fun getBondState(macAddress: String, promise: Promise){
            // works if you pass in the real mac address, so if using rpa this would fail saying NOT BONDED 
            try{
                val bluetoothManager = reactApplicationContext.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager

                val adapter = bluetoothManager.adapter

                if (adapter == null){
                    promise.reject("NO_ADAPTER", "Bluetooth Adapter is not availabel")
                    return
                }

                val device : BluetoothDevice = adapter.getRemoteDevice(macAddress)

                val state = device.bondState
                promise.resolve(state)

            }catch(e: Exception){
                promise.reject("GET_BOND_STATE_ERROR", "Error during fetching bond state", e)
            }
        }

        @ReactMethod
        fun getBondedDevices(promise : Promise){
            try{
                val bluetoothManager = reactApplicationContext.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
                val adapter = bluetoothManager.adapter
            
                if (adapter == null){
                    promise.reject("NO_ADAPTER", "Bluetooth Adapter is not availabel")
                    return
                }

                //iterate through bonded devices collection and collect each mac addresses
                val bonded = adapter.bondedDevices.map {it.address}

                promise.resolve(bonded)
            }catch (e : Exception){
                promise.reject("GET_BONDED_DEVICES_ERROR", "Error during fetching bonded devices mac addresses")
            }
        }
    }
