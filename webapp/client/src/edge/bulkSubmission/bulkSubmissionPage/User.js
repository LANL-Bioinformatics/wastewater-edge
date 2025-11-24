import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LoaderDialog } from '/src/edge/common/Dialogs'
import { getData, apis } from '/src/edge/common/util'
import BulkSubmissionSummary from '../results/BulkSubmissionSummary'
import BulkSubmissionResult from '../results/BulkSubmissionResult'

const User = (props) => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const [code, setCode] = useState()
  const [bulkSubmission, setBulkSubmission] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()

  useEffect(() => {
    const codeParam = params.get('code')
    if (codeParam) {
      setCode(codeParam)
    } else {
      navigate('/user/bulksubmissions')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const getBulkSubmission = () => {
      let url = `${apis.userBulkSubmissions}/${code}`
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
          <BulkSubmissionSummary bulkSubmission={bulkSubmission} type={'user'} />
          <br></br>
          <BulkSubmissionResult bulkSubmission={bulkSubmission} type={'user'} />
        </>
      )}
    </div>
  )
}

export default User
