import { useEffect, useState } from 'react'
import {
  clearLicense,
  loadLicense,
  storeLicense,
  verifyLicense,
  type LicenseInfo,
} from './license'

export function useLicense() {
  const [info, setInfo] = useState<LicenseInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    loadLicense()
      .then((v) => { if (alive) setInfo(v) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  async function activate(token: string): Promise<LicenseInfo | null> {
    const verified = await verifyLicense(token)
    if (verified) {
      storeLicense(token)
      setInfo(verified)
    }
    return verified
  }

  function deactivate() {
    clearLicense()
    setInfo(null)
  }

  return { info, pro: info?.tier === 'pro', loading, activate, deactivate }
}
