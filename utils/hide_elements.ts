const hideElements = (elements: (HTMLElement|null|undefined)[]) => {
  elements.forEach((element) => {
    if (!element) return;
    element.classList.remove('display-flex');
    element.classList.add('display-none');
  });
  
  return true;
};

export default hideElements;