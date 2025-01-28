import React, { useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import queryString from 'query-string'

function ORCIDOAuthCallback() {
  useEffect(() => {
    const parsed = queryString.parse(window.location.href)
    const decoded = jwtDecode(parsed.id_token)
    //pass user profile to SocialLogin
    if (window.opener) {
      window.opener.postMessage(decoded)
    }
    window.close()
  }, [])

  return <div className="animated fadeIn">hi ORCiD</div>
}

export default ORCIDOAuthCallback
