import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { LoaderDialog } from '/src/edge/common/Dialogs'
import { getData, apis } from '/src/edge/common/util'
import BulkSubmissionSummary from '../results/BulkSubmissionSummary'
import BulkSubmissionResult from '../results/BulkSubmissionResult'

const Admin = (props) => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const [code, setCode] = useState()
  const [bulkSubmission, setBulkSubmission] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()
  const user = useSelector((state) => state.user)

  useEffect(() => {
    if (user.profile.role !== 'admin') {
      navigate('/home')
    } else {
      const codeParam = params.get('code')
      if (codeParam) {
        setCode(codeParam)
      } else {
        navigate('/admin/bulksubmissions')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const getBulkSubmission = () => {
      let url = `${apis.adminBulkSubmissions}/${code}`
      getData(url)
        .then((data) => {
          setBulkSubmission(data.bulkSubmission)
          setLoading(false)
        })
        .catch((err) => {
          setError('Failed to load bulkSubmission')
          setLoading(false)
        })
    }
    if (code) {
      setLoading(true)
      getBulkSubmission()
    }
  }, [code])

  return (
    <div className="animated fadeIn">
      <LoaderDialog loading={loading} text="Loading..." />
      {error ? (
        <div className="clearfix">
          <h4 className="pt-3">BulkSubmission not found</h4>
          <hr />
          <p className="text-muted float-left">
            The bulkSubmission might be deleted or you have no permission to acces it.
          </p>
        </div>
      ) : (
        <>
          <BulkSubmissionSummary bulkSubmission={bulkSubmission} type={'admin'} />
          <br></br>
          <BulkSubmissionResult bulkSubmission={bulkSubmission} type={'admin'} />
        </>
      )}
    </div>
  )
}

export default Admin
