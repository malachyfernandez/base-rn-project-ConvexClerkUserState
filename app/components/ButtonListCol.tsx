import React, { PropsWithChildren } from 'react';
import { View } from 'react-native';

interface ButtonListColProps extends PropsWithChildren {
    className?: string;
}

const ButtonListCol = ({ children, className }: ButtonListColProps) => {
    return (
        <View className={`flex-col gap-4 ${className}`} >
            {children}
        </View>
    );
};

export default ButtonListCol;