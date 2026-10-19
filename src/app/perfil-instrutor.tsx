import { Redirect, useLocalSearchParams } from 'expo-router';
export default function Screen(){const {id,instrutorId}=useLocalSearchParams<{id?:string;instrutorId?:string}>();return <Redirect href={{pathname:'/painel',params:{instructor:id||instrutorId||''}}}/>;}
