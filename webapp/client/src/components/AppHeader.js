import React, { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { setSidebar } from '../redux/reducers/coreuiSlice'
import {
  CContainer,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  CHeaderBrand,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMenu } from '@coreui/icons'
import { MdLogout } from 'react-icons/md'

import { AppHeaderDropdown } from './header/index'
import logo from 'src/assets/brand/logo.png'
import { logout } from 'src/redux/reducers/edge/userSlice'
import OrcidLoginHelp from './OrcidLoginHelp'
import config from 'src/config'

const AppHeader = () => {
  const headerRef = useRef()

  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.coreui.sidebarShow)
  const navigate = useNavigate()
  const user = useSelector((state) => state.user)
  const [orcidid, setOrcidid] = useState()

  const signOut = (e) => {
    dispatch(logout())
    navigate('/login')
  }

  useEffect(() => {
    //get user's orcid id
    if (user.isAuthenticated) {
      setOrcidid(user.profile.email.split('@')[0])
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })
  }, [])

  return (
    <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
      <CContainer className="border-bottom px-4" fluid>
        {!sidebarShow && (
          <CHeaderBrand className="sidebar-brand-narrow" to="/">
            <img alt="logo" style={{ width: 150, height: 50 }} src={logo} />
          </CHeaderBrand>
        )}
        <CHeaderToggler
          onClick={() => dispatch(setSidebar(!sidebarShow))}
          style={{ marginInlineStart: '-14px' }}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>

        {user.isAuthenticated ? (
          <>
            <CHeaderNav className="d-none d-md-flex me-auto">
              <CNavItem>
                <CNavLink to="/user/projects" as={NavLink}>
                  My Projects
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink to="/user/uploads" as={NavLink}>
                  My Uploads
                </CNavLink>
              </CNavItem>
              {/*  <CNavItem>
                <CNavLink to="/user/sradata" as={NavLink}>
                  My SRA Data
                </CNavLink>
              </CNavItem> */}
              <CNavItem>
                <CNavLink to="/user/jobqueue" as={NavLink}>
                  Job Queue
                </CNavLink>
              </CNavItem>
            </CHeaderNav>
            <CHeaderNav className="ms-3">
              <AppHeaderDropdown user={user} logout={(e) => signOut(e)} />
            </CHeaderNav>
            {config.ORCID.IS_ENABLED && (
              <CHeaderNav className="edge-header-orcid" style={{ paddingRight: '0px' }}>
                <a href={'https://orcid.org/' + orcidid} target="_blank" rel="noreferrer">
                  <img
                    alt="OrcId logo"
                    style={{ paddingLeft: '12px' }}
                    src="https://orcid.org/assets/vectors/orcid.logo.icon.svg"
                    className="edge-header-orcid-img mr-2"
                  />
                </a>
              </CHeaderNav>
            )}
            <CHeaderNav className="edge-header-orcid" onClick={signOut}>
              <MdLogout size={24} className="edge-header-orcid-icon" />
            </CHeaderNav>
          </>
        ) : (
          <>
            {config.APP.USER_AUTH_IS_ENABLED && (
              <CHeaderNav className="ms-auto">
                <CNavLink to="/login" as={NavLink}>
                  Login
                </CNavLink>
                <CNavLink to="/register" as={NavLink}>
                  Sign up
                </CNavLink>
              </CHeaderNav>
            )}
            {config.ORCID.IS_ENABLED && (
              <CHeaderNav className="edge-header-orcid-login">
                <span className="edge-header-orcid">
                  <a href="/oauth">
                    <img
                      alt="OrcId login"
                      src="https://orcid.org/assets/vectors/orcid.logo.icon.svg"
                      className="edge-header-orcid-img mr-2"
                    />
                    &nbsp;&nbsp;OrcID Login
                  </a>
                </span>
                <div className="edge-header-orcid-login-help">
                  <OrcidLoginHelp />
                </div>
              </CHeaderNav>
            )}
          </>
        )}
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
