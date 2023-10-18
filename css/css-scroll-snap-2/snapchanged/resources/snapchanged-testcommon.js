function resetScroller(scroller) {
  return new Promise((resolve) => {
    if (scroller.scrollTop == 0 && scroller.scrollLeft == 0) {
      resolve();
    } else {
      scroller.scrollTop = 0;
      scroller.scrollLeft = 0;
      requestAnimationFrame(async () => {
        resetScroller(scroller).then(resolve);
      });
    }
  });
}

function assertSnapEvent(test, evt, expected_snap_target_ids) {
  test.step(() => {
    assert_equals(evt.bubbles, false, "snapchanged event bubbles");
    assert_false(evt.cancelable, "snapchanged event is not cancelable.");
    for (const element of evt.snapTargets) {
      assert_true(expected_snap_target_ids.has(element.id),
        "snapped to expected target");
    }
    assert_equals(evt.snapTargets.length, expected_snap_target_ids.size,
      "snapchanged event has the correct number of targets");
  });
}

async function test_snapchanged(test, test_data) {
  await resetScroller(test_data.scroller);
  await waitForCompositorCommit();
  test.step(() => {
    assert_equals(test_data.scroller.scrollTop, 0,
      "scroller is initially not scrolled");
    assert_equals(test_data.scroller.scrollLeft, 0,
      "scroller is initially not scrolled");
  });
  let snapchanged_fired = false;

  let snapchanged_promise = new Promise((resolve) => {
    function snapChangedHandler(evt) {
      snapchanged_fired = true;
      // resolve before assert so that a failed assert does not lead to a
      // timeout.
      resolve();
      assertSnapEvent(test, evt, test_data.expected_snap_targets);
    };
    let listener = test_data.scroller ==
        document.scrollingElement ? document : test_data.scroller;
    listener.addEventListener("snapchanged", snapChangedHandler);
    test.add_cleanup(() => {
      listener.removeEventListener("snapchanged", snapChangedHandler);
    });
  });

  await test_data.scrolling_function();
  await snapchanged_promise;

  test.step(() => {
    assert_equals(test_data.scroller.scrollTop,
      test_data.expected_scroll_offsets.y,
      "vertical scroll offset mismatch.");
    assert_equals(test_data.scroller.scrollLeft,
      test_data.expected_scroll_offsets.x,
      "horizontal scroll offset mismatch.");
  });
}
