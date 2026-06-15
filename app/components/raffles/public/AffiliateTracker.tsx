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

        "page_view",

    affiliateCode:

        aff,

    source:

        "landing",

    referrer:

        document.referrer || null,

    raffle_slug:

        window.location.pathname
            .split("/")
            .filter(Boolean)
            .pop(),

    metadata: {

        affiliateCode:

            aff,

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