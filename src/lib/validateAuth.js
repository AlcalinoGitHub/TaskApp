import Cookies from 'js-cookie';
import {supabase} from '$lib/supabase.js'

export async function validate() {
    let user = Cookies.get('auth');

    if (user) {
      user = JSON.parse(user);
      let username = user.name; 
      let password = (user.pass); 

      const {data, error} = await supabase
        .from('Users')
        .select('*')
        .eq('username', username)
        .eq('password', password)

      if(data != []){return true} else {return false}
    }
    return false
}
