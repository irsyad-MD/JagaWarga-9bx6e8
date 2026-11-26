import React,{memo} from 'react';
import {Animated} from 'react-native';
import {useRowAnimation} from '@/hooks/useRowAnimation';
interface AnimatedItemProps {index?:number;children:React.ReactNode;}
export const AnimatedItem=memo(function AnimatedItem({index=0,children}:AnimatedItemProps){const style=useRowAnimation(index);return <Animated.View style={style}>{children}</Animated.View>;});
