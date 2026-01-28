import React, { PropsWithChildren } from 'react';
import { View } from 'react-native';

interface ListItemProps extends PropsWithChildren {
    className?: string;
}

const ListItem = ({ children, className }: ListItemProps) => {
    return (
        <View className={`bg-gray-400 rounded-lg p-4 ${className}`}>
            {children}
        </View>            
    );
};

export default ListItem;