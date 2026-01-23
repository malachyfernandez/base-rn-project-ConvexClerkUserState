import { View, Text, TouchableOpacity, TextInput, FlatList, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useUserVariable } from "../hooks/useUserVariable";
import { useGlobalVariable } from "../hooks/useGlobalVariable";
import { useSyncUserData } from "../hooks/useSyncUserData";
import { useSearch } from "../hooks/useSearch";


import FriendCardItem from "./components/FriendCardItem";
import ChangeCountButton from "./components/ChangeCountButton";
import AuthButton from "./components/AuthButton";
import BigText from "./components/BigText";
import Subheading from "./components/Subheading";

import { SignedIn, SignedOut, useOAuth, useClerk, useUser } from "@clerk/clerk-expo";

import * as WebBrowser from "expo-web-browser";

import { useEffect, useState } from "react";


// Warm up the browser (required for Android reliability)
export const useWarmUpBrowser = () => {
  useEffect(() => {
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

  // global variabe example
  type fetchableNumber = number | null | undefined;
  const [count, setCount] = useGlobalVariable<fetchableNumber>("count", 0);
  // user specific variable example
  const [myCount, setMyCount] = useUserVariable<fetchableNumber>("count", 0);

  const [searchText, setSearchText] = useState("");
  const userSearch = useSearch<UserData>(searchText, "userData");

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}>
        <SignedIn>
          <View className="flex-col gap-10 items-center mt-10">
            <BigText>{count}</BigText>
            <View className="flex-row gap-4">
              <ChangeCountButton
                count={count}
                setCount={setCount}
                amount={1}
                label="Up"
              />
              <ChangeCountButton
                count={count}
                setCount={setCount}
                amount={-1}
                label="Down"
              />




            </View>

            <BigText>{myCount}</BigText>
            <View className="flex-row gap-4">
              <ChangeCountButton
                count={myCount}
                setCount={setMyCount}
                amount={1}
                label="Up"
              />
              <ChangeCountButton
                count={myCount}
                setCount={setMyCount}
                amount={-1}
                label="Down"
              />

            </View>
          </View>

          <View className="p-4 w-full gap-3">
            <Subheading>Find Friends</Subheading>

            {/* Search Input */}
            <TextInput
              placeholder="Search users..."
              placeholderTextColor="#94a3b8"
              value={searchText}
              onChangeText={setSearchText}
              className="bg-slate-800 text-white p-4 rounded-xl text-lg mb-4 border border-slate-700"
            />

            {/* Results List */}
            <View className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700">
              {userSearch.isLoading ? (
                <Text className="text-slate-400 p-4 text-center">Searching...</Text>
              ) : null}

              <FlatList
                data={userSearch.results}
                keyExtractor={(item) => item.userId}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <FriendCardItem item={item} />

                )}
                ListEmptyComponent={
                  (!userSearch.isLoading && userSearch.results.length === 0) ? (
                    <Text className="text-slate-500 p-4 text-center">No users found.</Text>
                  ) : null
                }
              />
            </View>
          </View>


          <TouchableOpacity onPress={() => signOut()} className="mt-8">
            <Text className="text-gray-500">Log Out</Text>
          </TouchableOpacity>
        </SignedIn>


        <SignedOut>
          <Text className="text-white text-3xl font-bold mb-12">
            Counter
          </Text>

          {/* Apple Button */}
          <AuthButton
            authFlow={startAppleFlow}
            buttonText="Continue with Apple"
          />
          <AuthButton
            authFlow={startGoogleFlow}
            buttonText="Continue with Google"
          />
        </SignedOut>
      </ScrollView>
    </SafeAreaView >
  );
}
