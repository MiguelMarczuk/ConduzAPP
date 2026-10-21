export type MeetingAddress={cep:string;street:string;number:string;neighborhood:string;city:string;uf:string};
export const emptyAddress:MeetingAddress={cep:"",street:"",number:"",neighborhood:"",city:"",uf:""};
export async function lookupCep(value:string,request:typeof fetch=fetch):Promise<Partial<MeetingAddress>>{
 const cep=value.replace(/\D/g,"");if(!/^\d{8}$/.test(cep))throw Error("Digite um CEP com oito dígitos.");
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),8000);
 try{const r=await request(`https://viacep.com.br/ws/${cep}/json/`,{signal:controller.signal});if(!r.ok)throw Error();const d=await r.json();if(d.erro)throw Error();return {street:String(d.logradouro||""),neighborhood:String(d.bairro||""),city:String(d.localidade||""),uf:String(d.uf||"")};}
 catch{throw Error("CEP não encontrado ou serviço indisponível. Preencha o endereço manualmente.");}finally{clearTimeout(timeout);}
}
