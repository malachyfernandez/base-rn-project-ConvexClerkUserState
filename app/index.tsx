import { View, Text, TouchableOpacity, TextInput, FlatList, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useUserVariable } from "../hooks/useUserVariable";
import { useGlobalVariable } from "../hooks/useGlobalVariable";
import { useSyncUserData } from "../hooks/useSyncUserData";
import { useSearch } from "../hooks/useSearch";
import { useFonts } from 'expo-font'; 

import FriendCardItem from "./components/FriendCardItem";
import ChangeCountButton from "./components/ChangeCountButton";
import AuthButton from "./components/AuthButton";
import BigText from "./components/BigText";
import Subheading from "./components/Subheading";

import { SignedIn, SignedOut, useOAuth, useClerk, useUser } from "@clerk/clerk-expo";

import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";

import { useEffect, useState } from "react";


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

  // --- FONT LOADING START ---
  const [fontsLoaded] = useFonts({
    'SevenSegment': require('../assets/fonts/7segment.ttf'),
  });
  // --- FONT LOADING END ---

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

  // --- GAME LOGIC START ---

  // 1. Define the 5 global score variables
  const [p1, setP1] = useGlobalVariable<number>("player1-score", 0);
  const [p2, setP2] = useGlobalVariable<number>("player2-score", 0);
  const [p3, setP3] = useGlobalVariable<number>("player3-score", 0);
  const [p4, setP4] = useGlobalVariable<number>("player4-score", 0);
  const [p5, setP5] = useGlobalVariable<number>("player5-score", 0);

  // 2. Local state to track which screen we are on (null = menu)
  const [currentView, setCurrentView] = useState<string | null>(null);

  // Helper to render a player control row in the Panel
  const renderControl = (label: string, score: any, setScore: any) => (
    <View className="flex-row items-center justify-between w-full mb-4 bg-slate-950 p-2 rounded-lg">
      <Text className="text-white font-bold text-xl w-1/4">{label}: {score}</Text>
      <View className="flex-row gap-2">
        <ChangeCountButton count={score} setCount={setScore} amount={1} label="+" />
        <ChangeCountButton count={score} setCount={setScore} amount={-1} label="-" />
      </View>
    </View>
  );

  // Helper to render the Digital Score
  const DigitalScore = ({ score }: { score: number | null | undefined }) => (
    <Text
      className=" text-red-700 text-9xl text-center my-10"
      style={{ fontFamily: 'SevenSegment' }}
    >
      {score}
    </Text>
  );

  // --- GAME LOGIC END ---

  // Wait for font to load before rendering
  if (!fontsLoaded) {
    return <View className="flex-1 bg-slate-900" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}>
        <SignedIn>
          <View className="flex-col gap-10 items-center mt-10 w-full px-4">

            {/* MAIN MENU: Select Identity */}
            {currentView === null && (
              <View className="w-full gap-4">
                <Subheading>Select Identity</Subheading>
                {[1, 2, 3, 4, 5].map((num) => (
                  <TouchableOpacity
                    key={num}
                    onPress={() => setCurrentView(`player${num}`)}
                    className="bg-blue-600 p-4 rounded-xl items-center"
                  >
                    <Text className="text-white text-lg font-bold">Player {num}</Text>
                  </TouchableOpacity>
                ))}

                <View className="h-[1px] bg-slate-700 my-2" />

                <TouchableOpacity
                  onPress={() => setCurrentView("panel")}
                  className="bg-purple-600 p-4 rounded-xl items-center"
                >
                  <Text className="text-white text-lg font-bold">Control Panel</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* PLAYER VIEWS: Read Only - Using DigitalScore */}
            {currentView === "player1" && <View><Subheading>Player 1 Score</Subheading><DigitalScore score={p1} /></View>}
            {currentView === "player2" && <View><Subheading>Player 2 Score</Subheading><DigitalScore score={p2} /></View>}
            {currentView === "player3" && <View><Subheading>Player 3 Score</Subheading><DigitalScore score={p3} /></View>}
            {currentView === "player4" && <View><Subheading>Player 4 Score</Subheading><DigitalScore score={p4} /></View>}
            {currentView === "player5" && <View><Subheading>Player 5 Score</Subheading><DigitalScore score={p5} /></View>}

            {/* PANEL VIEW: Controls */}
            {currentView === "panel" && (
              <View className="w-full">
                <Subheading>Game Master Panel</Subheading>
                {renderControl("P1", p1, setP1)}
                {renderControl("P2", p2, setP2)}
                {renderControl("P3", p3, setP3)}
                {renderControl("P4", p4, setP4)}
                {renderControl("P5", p5, setP5)}
              </View>
            )}

            {/* Navigation Controls */}
            {currentView !== null && (
              <TouchableOpacity onPress={() => setCurrentView(null)} className="mt-4 bg-slate-700 p-3 rounded-lg">
                <Text className="text-white">Back to Menu</Text>
              </TouchableOpacity>
            )}

          </View>

          <TouchableOpacity onPress={() => signOut()} className="mt-12">
            <Text className="text-gray-500">Log Out</Text>
          </TouchableOpacity>
        </SignedIn>


        <SignedOut>

          <View className="flex-col gap-10 items-center mt-10 w-full px-4">

            {/* MAIN MENU: Select Identity */}
            {currentView === null && (
              <View className="w-full gap-4">
                <Subheading>Select Identity</Subheading>
                {[1, 2, 3, 4, 5].map((num) => (
                  <TouchableOpacity
                    key={num}
                    onPress={() => setCurrentView(`player${num}`)}
                    className="bg-blue-600 p-4 rounded-xl items-center"
                  >
                    <Text className="text-white text-lg font-bold">Player {num}</Text>
                  </TouchableOpacity>
                ))}

                <View className="h-[1px] bg-slate-700 my-2" />

                <TouchableOpacity
                  onPress={() => setCurrentView("panel")}
                  className="bg-purple-600 p-4 rounded-xl items-center"
                >
                  <Text className="text-white text-lg font-bold">Control Panel</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* PLAYER VIEWS: Read Only (Click to exit) - Using DigitalScore */}
            {currentView === "player1" && <View>
              <TouchableOpacity onPress={() => setCurrentView(null)} className="mt-4 bg-none p-3 rounded-lg">
                <DigitalScore score={p1} />
              </TouchableOpacity>
            </View>}
            {currentView === "player2" && <View>
              <TouchableOpacity onPress={() => setCurrentView(null)} className="mt-4 bg-none p-3 rounded-lg">
                <DigitalScore score={p2} />
              </TouchableOpacity>
            </View>}
            {currentView === "player3" && <View>
              <TouchableOpacity onPress={() => setCurrentView(null)} className="mt-4 bg-none p-3 rounded-lg">
                <DigitalScore score={p3} />
              </TouchableOpacity>
            </View>}
            {currentView === "player4" && <View>
              <TouchableOpacity onPress={() => setCurrentView(null)} className="mt-4 bg-none p-3 rounded-lg">
                <DigitalScore score={p4} />
              </TouchableOpacity>
            </View>}
            {currentView === "player5" && <View>
              <TouchableOpacity onPress={() => setCurrentView(null)} className="mt-4 bg-none p-3 rounded-lg">
                <DigitalScore score={p5} />
              </TouchableOpacity>
            </View>}

            {/* PANEL VIEW: Controls */}
            {currentView === "panel" && (
              <View className="w-full">
                <Subheading>Game Master Panel</Subheading>
                {renderControl("P1", p1, setP1)}
                {renderControl("P2", p2, setP2)}
                {renderControl("P3", p3, setP3)}
                {renderControl("P4", p4, setP4)}
                {renderControl("P5", p5, setP5)}
              </View>
            )}

            {/* Navigation Controls */}
            {currentView === "panel" && (
              <TouchableOpacity onPress={() => setCurrentView(null)} className="mt-4 bg-slate-700 p-3 rounded-lg">
                <Text className="text-white">Back to Menu</Text>
              </TouchableOpacity>
            )}

          </View>
        </SignedOut>
      </ScrollView>
    </SafeAreaView >
  );
}