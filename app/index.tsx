import { View, Text, TouchableOpacity, ScrollView, Platform, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import { SignedIn, SignedOut, useOAuth, useClerk, useUser } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";

import { useUserVariable } from "../hooks/useUserVariable";
import { useGlobalVariable } from "../hooks/useGlobalVariable";
import { useSyncUserData } from "../hooks/useSyncUserData";
import { useSearch } from "../hooks/useSearch";

import ChangeCountButton from "./components/ChangeCountButton";
import AuthButton from "./components/AuthButton";
import BigText from "./components/BigText";
import DigitalScore from "./components/DigitalScore";
import ContainerCol from "./components/ContainerCol";
import ContainerRow from "./components/ContainerRow";
import ListItem from "./components/ListItem";

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


  // const [searchString, setSearchString] = useState();
  const userSearchArray = useSearch<UserData>("mal", "userData")

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
          {userData?.name ?
            (<Text className="text-white text-2xl">{`Welcome ${userData?.name}!`}</Text>) :
            (<Text className="text-white text-2xl">Welcome!</Text>)
          }
          <DigitalScore score={globalScore} />

          <ContainerRow>
            <ChangeCountButton count={globalScore} setCount={setGlobalScore} amount={1} label="+" />
            <ChangeCountButton count={globalScore} setCount={setGlobalScore} amount={-1} label="-" />
          </ContainerRow>

          <TouchableOpacity onPress={() => signOut()} className="mt-8">
            <Text className="text-gray-500">Log Out</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-blue-600 px-8 py-4 rounded-full active:opacity-80 mb-4 min-w-32 items-center">
            <Text className="text-white text-xl font-bold">{JSON.stringify(userSearchArray)}</Text>
          </TouchableOpacity>

          {userSearchArray ?
            (<FlatList
              data={userSearchArray}
              keyExtractor={(item, index) => item.userId ?? index.toString()}
              renderItem={({ item }) => (
                <ListItem className="mb-4 w-[90vw]">
                  <Text className="text-white text-xl">
                    {item.name}
                  </Text>
                </ListItem>
              )}
            />)
            :
            (<Text className="text-white text-xl">Loading...</Text>)
          }

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