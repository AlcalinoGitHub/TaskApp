<script>
    import Cookies from 'js-cookie';
    import sha256 from 'js-sha256';
    import '../accounts.css'

    async function login(){
        let error =  document.getElementById('error') //resets the error message
            error.innerHTML = ''
            error.classList.remove('failureOn')

        let username = document.getElementById('username').value
        let password = document.getElementById('password').value
        
        let user = {name: username, 
                    pass: password, 
                    type: 'login'}

        let response  = await fetch('/accounts', {
            method: 'POST',
            body: JSON.stringify(user)
        })

        if (response.ok){
            let data = await response.json()
            if (data == false){
                let error =  document.getElementById('error')
                error.innerHTML = 'User not Found'
                error.classList.toggle('failureOn')
            }
            else {
                let userCookie = {name: username, 
                                  pass: sha256(password),
                                }

                Cookies.set('auth', JSON.stringify(userCookie))
                window.location.href = '/'
            }
        } 

    }
</script>



<form on:submit={login}>
    <div class = 'title'>login</div>
    <input type = 'text' id = 'username' placeholder="username">
    <input type = 'password' id = 'password' placeholder="password">
    <input type = 'submit'>
    <div id = 'error' class = 'failure'></div>
</form>