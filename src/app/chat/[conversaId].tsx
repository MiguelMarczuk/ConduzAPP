import { Redirect, useLocalSearchParams } from 'expo-router';
export default function Screen(){const {instrutorId,alunoId}=useLocalSearchParams<{instrutorId?:string;alunoId?:string}>();return <Redirect href={{pathname:'/painel',params:{tab:'Mensagens',to:instrutorId||alunoId||''}}}/>;}
