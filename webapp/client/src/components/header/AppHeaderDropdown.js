import {
  CDropdown,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilFile,
  cilSettings,
  cilGrid,
  cilListNumbered,
  cilCloudUpload,
  cilList,
  cilPeople,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { FaUserCircle } from 'react-icons/fa'
import { MdLogout } from 'react-icons/md'
import { colors } from 'src/util'
import config from 'src/config'

const AppHeaderDropdown = (props) => {
  const userName = props.user.profile
    ? props.user.profile.firstName + ' ' + props.user.profile.lastName
    : 'undefined'
  const onLogoutClick = (e) => {
    e.preventDefault()
    props.logout()
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
        <span className="edge-header-orcid">
          <FaUserCircle color={colors.app} size={30} className="edge-header-orcid-icon" />
          <span className="edge-header-no-min">
            &nbsp;&nbsp;{props.user.profile.firstName} {props.user.profile.lastName}
          </span>
        </span>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">Projects</CDropdownHeader>
        <CDropdownItem href="/user/projects">
          <CIcon icon={cilGrid} className="me-2" />
          My Projects
        </CDropdownItem>
        <CDropdownItem href="/user/allprojects">
          <CIcon icon={cilGrid} className="me-2" />
          All Projects Available to Me
        </CDropdownItem>
        <CDropdownItem href="/user/jobqueue">
          <CIcon icon={cilListNumbered} className="me-2" />
          Job Queue
        </CDropdownItem>
        {config.APP.UPLOAD_IS_ENABLED && (
          <>
            <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">Files</CDropdownHeader>
            <CDropdownItem href="/user/uploads">
              <CIcon icon={cilCloudUpload} className="me-2" />
              My Uploads
            </CDropdownItem>
          </>
        )}
        {props.user && props.user.profile && props.user.profile.role === 'admin' && (
          <>
            <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">
              Admin Tools
            </CDropdownHeader>
            <CDropdownItem href="/admin/projects">
              <CIcon icon={cilList} className="me-2" />
              Manage Projects
            </CDropdownItem>
            {config.APP.BULK_SUBMISSIONS_IS_ENABLED && (
              <CDropdownItem href="/admin/bulkSubmissions">
                <CIcon icon={cilFile} className="me-2" />
                Manage Bulk Submissions
              </CDropdownItem>
            )}
            {config.APP.UPLOAD_IS_ENABLED && (
              <CDropdownItem href="/admin/uploads">
                <CIcon icon={cilFile} className="me-2" />
                Manage Uploads
              </CDropdownItem>
            )}
            <CDropdownItem href="/admin/users">
              <CIcon icon={cilPeople} className="me-2" />
              Manage Users
            </CDropdownItem>
          </>
        )}
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">Account</CDropdownHeader>
        <CDropdownItem href="/user/profile">
          <CIcon icon={cilSettings} className="me-2" />
          Profile
        </CDropdownItem>
        <CDropdownItem onClick={onLogoutClick}>
          <MdLogout size={18} className="edge-header-orcid-icon" />
          &nbsp;&nbsp;Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
