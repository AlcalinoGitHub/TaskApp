<script>
    import './main.css'
    import Cookies from 'js-cookie';
    import {validate} from '$lib/validateAuth.js'
    import {supabase} from '$lib/supabase.js'
    import { onMount } from 'svelte';
    let user = Cookies.get('auth')
    let username;

    if (user) {
      user = JSON.parse(user);
      username = user.name; 
    }

    const register = () => {window.location.href = '/accounts/register'}
    const login = () => {window.location.href = '/accounts/login'}
    const logout = () => {Cookies.remove('auth'); window.location.href = '/'}
    const chat = (user) => {window.location.href = `/chats/${user}`}
    const group = () => {window.location.href = '/GroupChat'}

    async function getUsers(){
        const {data, error} = await supabase
            .from('Users')
            .select('username')
            .not('username', 'eq', username)
        return data.map(({ username }) => ({ username }));
    }

    let isAuth = false

    let authResult = validate()
    authResult.then((result) => {if (result){isAuth = true}})



    let users = []

    onMount(async () => {
        users = await getUsers()
    })

</script>


<div class = 'title'>UpChat</div>



{#if isAuth}
    <br>
    <div class = 'welcome'>Welcome, {username}</div>
    <div on:click={group} class = 'interact'>GroupChats</div>
    <button on:click={logout} class = 'logout'>logout</button> <br> <br>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class = 'users'>
        {#each users as user} 
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div on:click={chat(user.username)} class = 'user'>
                    <div>{user.username}</div>
                    <div class = 'popup' id = 'popup:{user.username}'>Chat with: {user.username}</div>
                </div>  
        {/each}
    </div>

{:else}
    <div class = 'menu'>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div on:click={register} class = 'interact'>register</div>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div on:click={login} class = 'interact'>login</div> 
    </div>
{/if}

