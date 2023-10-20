import asyncio
import pytest
import webdriver.bidi.error as error
from webdriver.bidi.modules.script import ScriptEvaluateResultException

pytestmark = pytest.mark.asyncio

PAGE_EMPTY_TEXT = "/webdriver/tests/bidi/network/support/empty.txt"


@pytest.mark.parametrize("value", [None, False, 42, {}, []])
async def test_params_request_invalid_type(bidi_session, value):
    with pytest.raises(error.InvalidArgumentException):
        await bidi_session.network.continue_request(request=value)


@pytest.mark.parametrize("value", ["", "foo"])
async def test_params_request_invalid_value(bidi_session, value):
    with pytest.raises(error.NoSuchRequestException):
        await bidi_session.network.continue_request(request=value)


async def test_params_request_no_such_request(bidi_session, setup_network_test,
                                              wait_for_event, fetch, url):
    network_events = await setup_network_test(events=[
        "network.responseCompleted",
    ])

    text_url = url(PAGE_EMPTY_TEXT)
    on_response_completed = wait_for_event("network.responseCompleted")
    await fetch(text_url)
    await on_response_completed

    request = network_events["network.responseCompleted"][0]["request"]["request"]

    with pytest.raises(error.NoSuchRequestException):
        await bidi_session.network.continue_request(request=request)


@pytest.mark.parametrize("value", [False, 42, {}, []])
async def test_params_method_invalid_type(
        bidi_session, value, setup_network_test, url, fetch, wait_for_event,
        add_intercept):
    await setup_network_test(events=["network.beforeRequestSent"])

    text_url = url(PAGE_EMPTY_TEXT)
    await add_intercept(
        phases=["beforeRequestSent"],
        url_patterns=[{
            "type": "string",
            "pattern": text_url,
        }],
    )

    asyncio.ensure_future(fetch(text_url))
    event = await wait_for_event("network.beforeRequestSent")
    request = event["request"]["request"]

    with pytest.raises(error.InvalidArgumentException):
        await bidi_session.network.continue_request(request=request,
                                                    method=value)


# TODO: https://github.com/w3c/webdriver-bidi/issues/575
@pytest.mark.parametrize("value", ["", "GETT"])
async def test_params_method_invalid_value(
        bidi_session, value, setup_network_test, url, fetch, wait_for_event,
        add_intercept):
    request = await create_blocked_request(setup_network_test, url, add_intercept, fetch, wait_for_event)

    with pytest.raises(error.InvalidArgumentException):
        await bidi_session.network.continue_request(request=request,
                                                    url=value)


@pytest.mark.parametrize("protocol", ["http", "https"])
@pytest.mark.parametrize("value", [":invalid", "#invalid"])
async def test_params_url_invalid_value(
        bidi_session, protocol, value, setup_network_test, url, fetch, wait_for_event,
        add_intercept):
    request = await create_blocked_request(setup_network_test, url, add_intercept, fetch, wait_for_event)

    with pytest.raises(error.InvalidArgumentException):
        await bidi_session.network.continue_request(request=request,
                                                    url=f"{protocol}://{value}")


async def create_blocked_request(setup_network_test, url, add_intercept, fetch, wait_for_event):
    await setup_network_test(events=["network.beforeRequestSent"])

    text_url = url(PAGE_EMPTY_TEXT)
    await add_intercept(
        phases=["beforeRequestSent"],
        url_patterns=[{
            "type": "string",
            "pattern": text_url,
        }],
    )

    asyncio.ensure_future(fetch(text_url))
    event = await wait_for_event("network.beforeRequestSent")
    request = event["request"]["request"]

    with pytest.raises(error.InvalidArgumentException):
        await bidi_session.network.continue_request(request=request,
                                                    method=value)
