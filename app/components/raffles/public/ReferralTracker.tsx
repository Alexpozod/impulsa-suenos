"use client"

import { useEffect } from "react"

export default function ReferralTracker() {

    useEffect(() => {

        const params =
            new URLSearchParams(
                window.location.search
            )

        const ref =
    params.get("ref")

        if (!ref) {

    return

}

try {

   sessionStorage.setItem(
  "raffle_referral",
  ref
)

    fetch(

        "/api/raffles/track-event",

        {

            method: "POST",

            headers: {

                "Content-Type":

                    "application/json"

            },

            body: JSON.stringify({

    event_type:

    "referral_click",

    referralCode:

    ref,

    source:

        "landing",

    referrer:

        document.referrer || null,

    page:

    window.location.pathname,

    metadata: {

        referralCode:

    ref,

        page:

            window.location.pathname

    }

})

        }

    ).catch(() => {})

} catch (e) {

    console.error(e)

}

    }, [])

    return null

}