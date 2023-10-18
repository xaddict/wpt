// META: script=/resources/testdriver.js
// META: script=/common/utils.js
// META: script=resources/fledge-util.sub.js
// META: script=/common/subset-tests.js
// META: timeout=long
// META: variant=?1-5
// META: variant=?6-10
// META: variant=?11-last

"use strict;"

async function fetchDirectFromSellerSignals(headers_content) {
  const response = await fetch(
      createDirectFromSellerSignalsURL(),
      { adAuctionHeaders: true, headers: headers_content });

  if (!('Negative-Test-Option' in headers_content)) {
    assert_equals(
        response.status,
        200,
        'Failed to fetch directFromSellerSignals: ' + await response.text());
  }
  assert_false(
      response.headers.has('Ad-Auction-Signals'),
      'Header "Ad-Auction-Signals" should be hidden from documents.');
}

// Generate directFromSellerSignals evaluation code for different worklets and
// pass to `runReportTest()` as `codeToInsert`.
function directFromSellerSignalsValidatorCode(uuid, expectedSellerSignals,
    expectedAuctionSignals, expectedPerBuyerSignals) {
  return {
      scoreAd:
          `if (directFromSellerSignals === null ||
          directFromSellerSignals.sellerSignals !== ${expectedSellerSignals} ||
          directFromSellerSignals.auctionSignals !== ${expectedAuctionSignals} ||
          Object.keys(directFromSellerSignals).length != 2) {
            throw 'Failed to get expected directFromSellerSignals in scoreAd(): ' +
                JSON.stringify(directFromSellerSignals);
          }`,
      reportResultSuccessCondition:
          `directFromSellerSignals !== null &&
           directFromSellerSignals.sellerSignals === ${expectedSellerSignals} &&
           directFromSellerSignals.auctionSignals === ${expectedAuctionSignals} &&
           Object.keys(directFromSellerSignals).length == 2`,
      reportResult:
          `sendReportTo("${createSellerReportURL(uuid)}");`,
      generateBid:
          `if (directFromSellerSignals === null ||
           directFromSellerSignals.perBuyerSignals !== ${expectedPerBuyerSignals} ||
           directFromSellerSignals.auctionSignals !== ${expectedAuctionSignals} ||
           Object.keys(directFromSellerSignals).length != 2) {
            throw 'Failed to get expected directFromSellerSignals in generateBid(): ' +
                JSON.stringify(directFromSellerSignals);
        }`,
      reportWinSuccessCondition:
          `directFromSellerSignals !== null &&
           directFromSellerSignals.perBuyerSignals === ${expectedPerBuyerSignals} &&
           directFromSellerSignals.auctionSignals === ${expectedAuctionSignals} &&
           Object.keys(directFromSellerSignals).length == 2`,
      reportWin:
          `sendReportTo("${createBidderReportURL(uuid)}");`,
  };
}

subsetTest(promise_test, async test => {
  const uuid = generateUuid(test);
  await fetchDirectFromSellerSignals({ 'Buyer-Origin': window.location.origin });
  await runReportTest(
      test, uuid,
      directFromSellerSignalsValidatorCode(
          uuid, /*expectedSellerSignals=*/null,
          /*expectedAuctionSignals=*/null, /*expectedPerBuyerSignals=*/null),
      // expectedReportUrls
      [createSellerReportURL(uuid), createBidderReportURL(uuid)],
      // renderURLOverride
      null,
      // directFromSellerSignalsHeaderAdSlot
      'adSlot/0'
  );
}, 'Test directFromSellerSignals with empty Ad-Auction-Signals header.');

subsetTest(promise_test, async test => {
  const uuid = generateUuid(test);
  await fetchDirectFromSellerSignals({ 'Buyer-Origin': window.location.origin });
  await runReportTest(
      test, uuid,
      directFromSellerSignalsValidatorCode(
          uuid, '"sellerSignals/1"',
          /*expectedAuctionSignals=*/null, /*expectedPerBuyerSignals=*/null),
      // expectedReportUrls
      [createSellerReportURL(uuid), createBidderReportURL(uuid)],
      // renderURLOverride
      null,
      // directFromSellerSignalsHeaderAdSlot
      'adSlot/1'
  );
}, 'Test directFromSellerSignals with only sellerSignals.');

subsetTest(promise_test, async test => {
  const uuid = generateUuid(test);
  await fetchDirectFromSellerSignals({ 'Buyer-Origin': window.location.origin });
  await runReportTest(
      test, uuid,
      directFromSellerSignalsValidatorCode(
          uuid, /*expectedSellerSignals=*/null,
          '"auctionSignals/2"', /*expectedPerBuyerSignals=*/null),
      // expectedReportUrls
      [createSellerReportURL(uuid), createBidderReportURL(uuid)],
      // renderURLOverride
      null,
      // directFromSellerSignalsHeaderAdSlot
      'adSlot/2'
  );
}, 'Test directFromSellerSignals with only auctionSignals.');

subsetTest(promise_test, async test => {
  const uuid = generateUuid(test);
  await fetchDirectFromSellerSignals({ 'Buyer-Origin': window.location.origin });
  await runReportTest(
      test, uuid,
      directFromSellerSignalsValidatorCode(
          uuid, /*expectedSellerSignals=*/null,
          /*expectedAuctionSignals=*/null, '"perBuyerSignals/3"'),
      // expectedReportUrls
      [createSellerReportURL(uuid), createBidderReportURL(uuid)],
      // renderURLOverride
      null,
      // directFromSellerSignalsHeaderAdSlot
      'adSlot/3'
  );
}, 'Test directFromSellerSignals with only perBuyerSignals.');

subsetTest(promise_test, async test => {
  const uuid = generateUuid(test);
  await fetchDirectFromSellerSignals({ 'Buyer-Origin': window.location.origin });
  await runReportTest(
      test, uuid,
      directFromSellerSignalsValidatorCode(
          uuid, '"sellerSignals/4"',
          '"auctionSignals/4"', '"perBuyerSignals/4"'),
      // expectedReportUrls
      [createSellerReportURL(uuid), createBidderReportURL(uuid)],
      // renderURLOverride
      null,
      // directFromSellerSignalsHeaderAdSlot
      'adSlot/4'
  );
}, 'Test directFromSellerSignals with sellerSignals, auctionSignals and perBuyerSignals.');

subsetTest(promise_test, async test => {
  const uuid = generateUuid(test);
  await fetchDirectFromSellerSignals({ 'Buyer-Origin': '*' });
  await runReportTest(
      test, uuid,
      directFromSellerSignalsValidatorCode(
          uuid, '"sellerSignals/5"',
          '"auctionSignals/5"', /*expectedPerBuyerSignals=*/null),
      // expectedReportUrls
      [createSellerReportURL(uuid), createBidderReportURL(uuid)],
      // renderURLOverride
      null,
      // directFromSellerSignalsHeaderAdSlot
      'adSlot/5'
  );
}, 'Test directFromSellerSignals with mismatched perBuyerSignals.');

subsetTest(promise_test, async test => {
  const uuid = generateUuid(test);
  await fetchDirectFromSellerSignals({ 'Buyer-Origin': window.location.origin });
  await runReportTest(
    test, uuid,
    directFromSellerSignalsValidatorCode(
      uuid, '"sellerSignals/5"',
      '"auctionSignals/5"', /*expectedPerBuyerSignals=*/null),
    // expectedReportUrls
    [createSellerReportURL(uuid), createBidderReportURL(uuid)],
    // renderURLOverride
    null,
    // directFromSellerSignalsHeaderAdSlot
    'adSlot/5'
  );
}, 'Test directFromSellerSignals does not support wildcard for buyerOrigin of perBuyerSignals.');

subsetTest(promise_test, async test => {
  const uuid = generateUuid(test);
  await fetchDirectFromSellerSignals({ 'Buyer-Origin': window.location.origin });
  await runReportTest(
      test, uuid,
      directFromSellerSignalsValidatorCode(
          uuid, /*expectedSellerSignals=*/null,
          /*expectedAuctionSignals=*/null, /*expectedPerBuyerSignals=*/null),
      // expectedReportUrls
      [createSellerReportURL(uuid), createBidderReportURL(uuid)],
      // renderURLOverride
      null,
      // directFromSellerSignalsHeaderAdSlot
      'adSlot/non-exist'
  );
}, 'Test directFromSellerSignals with non-existent adSlot.');

subsetTest(promise_test, async test => {
  const uuid = generateUuid(test);
  await fetchDirectFromSellerSignals({ 'Buyer-Origin': window.location.origin });
  await runReportTest(
      test, uuid,
      directFromSellerSignalsValidatorCode(
          uuid, /*expectedSellerSignals=*/null,
          /*expectedAuctionSignals=*/null, /*expectedPerBuyerSignals=*/null),
      [createSellerReportURL(uuid), createBidderReportURL(uuid)],
      // renderURLOverride
      null,
      // directFromSellerSignalsHeaderAdSlot
      null
  );
}, 'Test directFromSellerSignals with null directFromSellerSignalsHeaderAdSlot.');

subsetTest(promise_test, async test => {
  const uuid = generateUuid(test);
  await fetchDirectFromSellerSignals({ 'Buyer-Origin': window.location.origin });
  await runReportTest(
      test, uuid,
      directFromSellerSignalsValidatorCode(
          uuid, /*expectedSellerSignals=*/null,
          /*expectedAuctionSignals=*/null, /*expectedPerBuyerSignals=*/null),
      [createSellerReportURL(uuid), createBidderReportURL(uuid)]
  );
}, 'Test directFromSellerSignals with no directFromSellerSignalsHeaderAdSlot.');

subsetTest(promise_test, async test => {
  const uuid = generateUuid(test);
  await fetchDirectFromSellerSignals({ 'Negative-Test-Option': 'HTTP Error' });
  await runReportTest(
      test, uuid,
      directFromSellerSignalsValidatorCode(
          uuid, /*expectedSellerSignals=*/null,
          /*expectedAuctionSignals=*/null, /*expectedPerBuyerSignals=*/null),
      // expectedReportUrls
      [createSellerReportURL(uuid), createBidderReportURL(uuid)],
      // renderURLOverride
      null,
      // directFromSellerSignalsHeaderAdSlot
      'adSlot'
  );
}, 'Test directFromSellerSignals with HTTP error.');

subsetTest(promise_test, async test => {
  const uuid = generateUuid(test);
  await fetchDirectFromSellerSignals({ 'Negative-Test-Option': 'No Ad-Auction-Signals Header' });
  await runReportTest(
      test, uuid,
      directFromSellerSignalsValidatorCode(
          uuid, /*expectedSellerSignals=*/null,
          /*expectedAuctionSignals=*/null, /*expectedPerBuyerSignals=*/null),
      // expectedReportUrls
      [createSellerReportURL(uuid), createBidderReportURL(uuid)],
      // renderURLOverride
      null,
      // directFromSellerSignalsHeaderAdSlot
      'adSlot'
  );
}, 'Test directFromSellerSignals with no returned Ad-Auction-Signals Header.');

subsetTest(promise_test, async test => {
  const uuid = generateUuid(test);
  await fetchDirectFromSellerSignals({ 'Negative-Test-Option': 'Invalid Json' });
  await runReportTest(
      test, uuid,
      directFromSellerSignalsValidatorCode(
          uuid, /*expectedSellerSignals=*/null,
          /*expectedAuctionSignals=*/null, /*expectedPerBuyerSignals=*/null),
      // expectedReportUrls
      [createSellerReportURL(uuid), createBidderReportURL(uuid)],
      // renderURLOverride
      null,
      // directFromSellerSignalsHeaderAdSlot
      'adSlot'
  );
}, 'Test directFromSellerSignals with invalid json in Ad-Auction-Signals header.');

subsetTest(promise_test, async test => {
  const uuid = generateUuid(test);
  await fetchDirectFromSellerSignals({ 'Negative-Test-Option': 'Network Error' });
  await runReportTest(
      test, uuid,
      directFromSellerSignalsValidatorCode(
          uuid, '"sellerSignals"',
          '"auctionSignals"', /*expectedPerBuyerSignals=*/null),
      // expectedReportUrls
      [createSellerReportURL(uuid), createBidderReportURL(uuid)],
      // renderURLOverride
      null,
      // directFromSellerSignalsHeaderAdSlot
      'adSlot'
  );
}, 'Test directFromSellerSignals with network error.');
