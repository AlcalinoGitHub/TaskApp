import {supabase} from '$lib/supabase.js'
import sha256 from 'js-sha256';

async function getUsers(){
    const {data, error} = await supabase
        .from('Users')
        .select('*')
    console.log(data)
    return data
}


export async function POST(requestEvent){
    //Get data from request
    const request = requestEvent.request
    const body = await request.json()
    const username = body.name
    const password = sha256(body.pass)
    const type = body.type

    if (type == 'register'){
        let users = await getUsers()

        for (let user of users){
            if (user.username == username){
                return new Response(false)
            }
        } 

        const {data, error} = await supabase
            .from('Users')
            .insert([{username, password}])

        if (error){console.log(error);return new Response('Error')}
        else {console.log('user created');return new Response(true)}
    }

    if (type == 'login'){
        let users = await getUsers()
        for (let user of users){
            if (user.username == username && user.password == password){
                return new Response(true)
            }
        }
        return new Response(false)
    }


    return new Response(false)
}