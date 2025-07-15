import { useEffect, useState, useCallback } from "react";
import { Alert } from "react-native";
import { AdMobRewarded } from "expo-ads-admob";
import api from "../api/client";

export default function useRewardedUnlock(adUnitId) {
  const [unlocked, setUnlocked] = useState(false);

  const showRewardedAd = useCallback(async () => {
    try {
      await AdMobRewarded.setAdUnitID(adUnitId);
      await AdMobRewarded.requestAdAsync();
      await AdMobRewarded.showAdAsync();
    } catch (error) {
      console.error("Failed to show rewarded ad:", error);
      Alert.alert("Error", "Couldn't show ad. Please try again later.");
    }
  }, [adUnitId]);

  useEffect(() => {
    const rewardListener = AdMobRewarded.addEventListener(
      "rewardedVideoUserDidEarnReward",
      async () => {
        console.log("User watched rewarded ad, unlocking feature!");
        setUnlocked(true);
        try {
          const res = await api.post("/redeem-reward");
          console.log("Backend acknowledged reward:", res.data);
        } catch (err) {
          console.error("Failed to notify backend:", err);
        }
      }
    );

    return () => {
      rewardListener.remove();
    };
  }, []);

  return { unlocked, showRewardedAd };
}