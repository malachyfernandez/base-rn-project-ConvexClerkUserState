import React, { PropsWithChildren } from 'react';
import { View, Text } from 'react-native';
import ListItem from './ListItem';
import { useUserVariable } from 'hooks/useUserVariable';
import Spacer from './Spacer';


interface SearchItemCardProps extends PropsWithChildren {
    className?: string;
    userId?: string;
}

const SearchItemCard = ({ children, className, userId }: SearchItemCardProps) => {
    const [userScore] = useUserVariable<number>({
        key: "userScore",
        defaultValue: 0,
        userId: userId
    });
    const [userData] = useUserVariable<{
        name: string;
        email: string;
    }>({
        key: "userData",
        userId: userId
    });

    return (
        <View className="gap-0 w-full items-center">
            <ListItem>
                <Text className="text-white text-xl">
                    {userData?.name}
                </Text>
                <Spacer/>
                <Text className="text-white text-xl">
                    {userScore}
                </Text>
            </ListItem>
        </View>
    );
};

export default SearchItemCard;