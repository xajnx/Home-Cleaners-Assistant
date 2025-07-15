// src/screens/ProFeatureScreen.jsx

import React, { useState, useEffect } from "react";
import { View, Text, Button, Alert } from "react-native";
import { AdMobRewarded } from "expo-ads-admob";
import api from "../api/client";  // axios client with backend baseURL

export default function ProFeatureScreen() {
  const [unlocked, setUnlocked] = useState(false);

  // Set up rewarded ad listeners
  useEffect(() => {
    AdMobRewarded.addEventListener("rewardedVideoUserDidEarnReward", async () => {
      console.log("User watched the ad and earned reward!");
      // Grant temporary unlock locally:
      setUnlocked(true);

      try {
        // Optional but recommended: notify backend of reward redemption
        const res = await api.post("/redeem-reward");
        console.log("Backend acknowledged reward:", res.data);
      } catch (err) {
        console.error("Failed to notify backend:", err);
      }
    });

    return () => {
      AdMobRewarded.removeAllListeners();
    };
  }, []);

  const showRewardedAd = async () => {
    try {
      await AdMobRewarded.setAdUnitID("ca-app-pub-xxxxxx/xxxxxx");  // replace with real AdMob ID
      await AdMobRewarded.requestAdAsync();
      await AdMobRewarded.showAdAsync();
    } catch (error) {
      console.error("Failed to show rewarded ad:", error);
      Alert.alert("Error", "Couldn't show ad. Please try again later.");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {!unlocked ? (
        <>
          <Text style={{ fontSize: 18, marginBottom: 20 }}>
            This feature is Pro-only.
          </Text>
          <Button title="Unlock by watching an ad" onPress={showRewardedAd} />
        </>
      ) : (
        <>
          <Text style={{ fontSize: 18, marginBottom: 20 }}>
            🎉 Feature Unlocked! 🎉
          </Text>
          <Button title="Use Pro Feature Now" onPress={() => {
            // Call your Pro feature logic here, e.g. square footage estimation
          }} />
        </>
      )}
    </View>
  );
}