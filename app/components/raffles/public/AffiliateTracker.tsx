"use client"

import { useEffect } from "react"

export default function AffiliateTracker() {

    useEffect(() => {

        const params =
            new URLSearchParams(
                window.location.search
            )

        const aff =
            params.get("aff")

        if (!aff) {

    return

}

try {

    localStorage.setItem(

        "raffle_affiliate",

        aff

    )

    sessionStorage.setItem(

        "raffle_affiliate",

        aff

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

                    "affiliate_click",

                affiliateCode:

                    aff,

                source:

                    "landing",

                page:

                    window.location.pathname

            })

        }

    ).catch(() => {})

} catch (e) {

    console.error(e)

}

    }, [])

    return null

}