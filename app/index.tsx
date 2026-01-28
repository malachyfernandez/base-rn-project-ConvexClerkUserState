import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { SignedIn, SignedOut, useOAuth, useClerk, useUser } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";

import { useUserVariable } from "../hooks/useUserVariable";
import { useGlobalVariable } from "../hooks/useGlobalVariable";
import { useSyncUserData } from "../hooks/useSyncUserData";

import ChangeCountButton from "./components/ChangeCountButton";
import AuthButton from "./components/AuthButton";
import BigText from "./components/BigText";
import DigitalScore from "./components/DigitalScore";
import ContainerCol from "./components/ContainerCol";
import ContainerRow from "./components/ContainerRow";

// Warm up the browser (required for Android reliability)
export const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS === "web") return;
    void WebBrowser.warmUpAsync();
    return () => { void WebBrowser.coolDownAsync(); };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

export default function HomeScreen() {
  useWarmUpBrowser();
  const { signOut } = useClerk();

  // Setup OAuth Hooks for both providers
  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: "oauth_apple" });

  const { user } = useUser();

  interface UserData {
    email?: string;
    name?: string;
    userId?: string
  };

  const [userData, setUserData] = useUserVariable<UserData>("userData", {}, {
    isPublic: true,
    searchKey: "name"
  });

  // updates userData
  useSyncUserData(userData, setUserData);


  const [globalScore, setGlobalScore] = useGlobalVariable<number>("globalScore", 0);

  // 2. Local state to track which screen we are on (null = menu)
  const [currentView, setCurrentView] = useState<string | null>(null);

  // Keyboard listener
  useEffect(() => {
    const handleKeyPress = (event: any) => {
      const key = event.key;

      if (key == '1') {
        if (globalScore !== null && globalScore !== undefined) {
          setGlobalScore(globalScore + 1);
        }
      }

      //Shift version (1 is !)
      if (key == '!') {
        if (globalScore !== null && globalScore !== undefined) {
          setGlobalScore(globalScore - 1);
        }
      }
    };

    // Add keyboard event listener
    if (Platform.OS === 'web') {
      window.addEventListener('keydown', handleKeyPress);
      return () => {
        window.removeEventListener('keydown', handleKeyPress);
      };
    }
  }, [globalScore, setGlobalScore]);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}>

        
        <DigitalScore score={globalScore} />

        <ContainerRow>
          <ChangeCountButton count={globalScore} setCount={setGlobalScore} amount={1} label="+" />
          <ChangeCountButton count={globalScore} setCount={setGlobalScore} amount={-1} label="-" />
        </ContainerRow>

        <SignedIn>
          <BigText>HELLO</BigText>
          <TouchableOpacity onPress={() => signOut()} className="mt-8">
            <Text className="text-gray-500">Log Out</Text>
          </TouchableOpacity>
        </SignedIn>

        <SignedOut>
          <ContainerCol>
            <AuthButton
              authFlow={startAppleFlow}
              buttonText="Continue with Apple"
            />
            <AuthButton
              authFlow={startGoogleFlow}
              buttonText="Continue with Google"
            />
          </ContainerCol>



        </SignedOut>
      </ScrollView>
    </SafeAreaView>
  );
}