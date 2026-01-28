import React, { PropsWithChildren } from 'react';
import { View, Text } from 'react-native';
import ListItem from './ListItem';
import { useUserVariable } from 'hooks/useUserVariable';


interface SearchItemCardProps extends PropsWithChildren {
    className?: string;
    userId?: string;
}

const SearchItemCard = ({ children, className, userId }: SearchItemCardProps) => {
    const { user } = useUserVariable("")
    
    return (
        <View className="gap-0 w-full items-center">
                  <ListItem>
                    <Text className="text-white text-xl">
                      {userId}
                    </Text>
                  </ListItem>
                </View>         
    );
};

export default SearchItemCard;