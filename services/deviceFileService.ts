import * as ExpoFileSystem from 'expo-file-system';
import {decode} from 'base64-arraybuffer';
// Supports both modern Expo File APIs and the classic SDK APIs without a version-specific subpath.
const fs=ExpoFileSystem as any;
export async function readLocalBase64(uri:string):Promise<string>{if(fs.File&&fs.Paths){const file=new fs.File(uri);return await file.base64();}return await fs.readAsStringAsync(uri,{encoding:'base64'});}
export async function writeCacheFile(name:string,content:string,base64=false):Promise<string>{if(fs.File&&fs.Paths){const file=new fs.File(fs.Paths.cache,name);file.create({overwrite:true});file.write(base64?new Uint8Array(decode(content)):content);return file.uri;}const uri=`${fs.cacheDirectory}${name}`;await fs.writeAsStringAsync(uri,content,{encoding:base64?'base64':'utf8'});return uri;}
