import {useRef,useState} from "react";
import {View} from "react-native";
import {Input} from "./ui/input";
import {Button} from "./ui/button";
import {ThemedText as Text} from "./themed-text";
import {lookupCep,type MeetingAddress} from "@/lib/cep";
import {panelStyles as s} from "@/constants/panel-styles";
export function AddressForm({value,onChange}:{value:MeetingAddress;onChange:(a:MeetingAddress)=>void}){
 const [message,setMessage]=useState(""),[loading,setLoading]=useState(false);const version=useRef(0),latest=useRef(value);latest.current=value;
 function change(key:keyof MeetingAddress,text:string){version.current++;onChange({...value,[key]:text});}
 async function lookup(){const v=++version.current;setLoading(true);setMessage("");try{const found=await lookupCep(value.cep);if(v===version.current){onChange({...latest.current,...found});setMessage("Endereço preenchido. Confira e informe o número.");}}catch(e){if(v===version.current)setMessage(e instanceof Error?e.message:"Preencha manualmente.");}finally{setLoading(false);}}
 return <View style={s.gap}><Input label="CEP (opcional)" value={value.cep} onChangeText={t=>change("cep",t)} keyboardType="number-pad" maxLength={9}/><Button title="Buscar CEP" variant="secondary" onPress={lookup} loading={loading}/>{!!message&&<Text accessibilityRole="alert">{message}</Text>}{([['street','Rua (obrigatória)'],['number','Número (obrigatório; aceita s/n)'],['neighborhood','Bairro (obrigatório)'],['city','Cidade (obrigatória)'],['uf','UF (obrigatória)']] as const).map(([key,label])=><Input key={key} label={label} value={value[key]} onChangeText={t=>change(key,t)} autoCapitalize={key==='uf'?'characters':'sentences'} maxLength={key==='uf'?2:120}/>)}</View>;
}
