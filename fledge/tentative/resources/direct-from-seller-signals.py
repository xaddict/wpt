import json

# Script to return hardcoded "Ad-Auction-Signals" header to test header-based
# directFromSellerSignals. Requires a "Sec-Ad-Auction-Fetch" header with value
# of b"?1" in the request, otherwise returns a 400 response.
#
# Header "Negative-Test-Option" is used to return some specific hardcoded
# response for some negative test cases.
#
# For all positive test cases, header "Buyer-Origin" is required to be the
# origin in perBuyerSignals, otherwise return 400 response.
def main(request, response):
    # Return 400 if there is no "Sec-Ad-Auction-Fetch" header.
    if ("Sec-Ad-Auction-Fetch" not in request.headers or
        request.headers.get("Sec-Ad-Auction-Fetch") != b"?1"):
      response.status = (400, b"Bad Request")
      response.headers.set(b"Content-Type", b"text/plain")
      return "Failed to get Sec-Ad-Auction-Fetch in headers or its value is not \"?1\"."

    # Return 500 to test http error.
    if ("Negative-Test-Option" in request.headers and
        request.headers.get("Negative-Test-Option") == b"HTTP Error"):
      response.status = (500, b"Internal Error")
      response.headers.set(b"Content-Type", b"text/plain")
      return "Test http error with 500 response."

    # Return 200 but without "Ad-Auction-Signals" header.
    if ("Negative-Test-Option" in request.headers and
        request.headers.get("Negative-Test-Option") == b"No Ad-Auction-Signals Header"):
      response.status = (200, b"OK")
      response.headers.set(b"Content-Type", b"text/plain")
      return "Test 200 response without \"Ad-Auction-Signals\" header."

    # Return 200 but with invalid json in "Ad-Auction-Signals" header.
    if ("Negative-Test-Option" in request.headers and
        request.headers.get("Negative-Test-Option") == b"Invalid Json"):
      response.status = (200, b"OK")
      response.headers.set(b"Content-Type", b"text/plain")
      response.headers.set("Ad-Auction-Signals", b"[{\"adSlot\": \"adSlot\", \"sellerSignals\": \"sellerSignals\", \"auctionSignals\":}]")
      return "Test 200 response with invalid json in \"Ad-Auction-Signals\" header."

    # Return 404 but with valid "Ad-Auction-Signals" header to test network error.
    if ("Negative-Test-Option" in request.headers and
        request.headers.get("Negative-Test-Option") == b"Network Error"):
      response.status = (404, b"Not Found")
      response.headers.set(b"Content-Type", b"text/plain")
      adAuctionSignals = json.dumps(
         [{
            "adSlot": "adSlot",
            "sellerSignals": "sellerSignals",
            "auctionSignals": "auctionSignals"
          }])
      response.headers.set("Ad-Auction-Signals", adAuctionSignals)
      return "Test network error with 400 response code and valid \"Ad-Auction-Signals\" header."

    # For positive test cases, buyer-origin is required, otherwise return 400.
    if "Buyer-Origin" not in request.headers:
      response.status = (400, "Bad Request")
      response.headers.set(b"Content-Type", b"text/plain")
      return "Failed to get Buyer-Origin in headers."

    response.status = (200, b"OK")
    buyerOrigin = request.headers.get("Buyer-Origin").decode('utf-8')
    adAuctionSignals = json.dumps(
      [{
        "adSlot": "adSlot/0",
      },
      {
        "adSlot": "adSlot/1",
        "sellerSignals": "sellerSignals/1",
      },
      {
        "adSlot": "adSlot/2",
        "auctionSignals": "auctionSignals/2",
      },
      {
        "adSlot": "adSlot/3",
        "perBuyerSignals": { buyerOrigin: "perBuyerSignals/3" }
      },
      {
        "adSlot": "adSlot/4",
        "sellerSignals": "sellerSignals/4",
        "auctionSignals": "auctionSignals/4",
        "perBuyerSignals": { buyerOrigin: "perBuyerSignals/4" }
      },
      {
        "adSlot": "adSlot/5",
        "sellerSignals": "sellerSignals/5",
        "auctionSignals": "auctionSignals/5",
        "perBuyerSignals": { "mismatchOrigin": "perBuyerSignals/5" }
      }])

    response.headers.set("Ad-Auction-Signals", adAuctionSignals)
    return
