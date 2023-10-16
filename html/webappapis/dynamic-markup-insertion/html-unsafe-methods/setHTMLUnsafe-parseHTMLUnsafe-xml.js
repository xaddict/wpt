window.onload = () => {
  test(() => {
    assert_equals(document.contentType, 'application/xml',
      'This test should run in an XML document.');
    assert_true(document instanceof XMLDocument,
      'document should be an XMLDocument.');

    const div = document.createElement('div');
    div.setHTMLUnsafe('<span>no closing tag');
    assert_equals(div.innerHTML, '<span>no closing tag</span>');
  }, 'setHTMLUnsafe should still parse HTML even in an XML document.');

  test(() => {
    assert_equals(document.contentType, 'application/xml',
      'This test should run in an XML document.');
    assert_true(document instanceof XMLDocument,
      'document should be an XMLDocument.');

    const output = document.parseHTMLUnsafe('<span>no closing tag');
    assert_equals(output.innerHTML, '<span>no closing tag</span>');
  }, 'parseHTMLUnsafe should still parse HTML even in an XML document.');
};
