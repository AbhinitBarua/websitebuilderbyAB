document.addEventListener('DOMContentLoaded', function() {
  // Global variables
  const canvas = document.getElementById('canvas');
  const propertiesContent = document.getElementById('propertiesContent');
  const newButton = document.getElementById('newButton');
  const codeButton = document.getElementById('codeButton');
  const deleteButton = document.getElementById('deleteButton');
  const codeModal = document.getElementById('codeModal');
  const codeOutput = document.getElementById('codeOutput');
  const copyCodeButton = document.getElementById('copyCodeButton');
  
  let selectedElement = null;
  let elementCounter = 0;
  let isDragging = false;
  let startX, startY, startLeft, startTop;
  
  // Element creation functions
  const elementCreators = {
    heading: () => {
      const el = document.createElement('h2');
      el.innerText = 'Heading Text';
      el.className = 'element heading';
      el.style.fontSize = '24px';
      el.style.color = '#333333';
      return el;
    },
    paragraph: () => {
      const el = document.createElement('p');
      el.innerText = 'This is a paragraph. Double-click to edit the text.';
      el.className = 'element';
      el.style.fontSize = '16px';
      el.style.color = '#333333';
      return el;
    },
    button: () => {
      const el = document.createElement('button');
      el.innerText = 'Button';
      el.className = 'element';
      el.style.padding = '8px 16px';
      el.style.backgroundColor = '#3498db';
      el.style.color = '#ffffff';
      el.style.border = 'none';
      el.style.borderRadius = '4px';
      return el;
    },
    image: () => {
      const el = document.createElement('img');
      el.src = '/api/placeholder/300/200';
      el.alt = 'Image';
      el.className = 'element';
      el.style.width = '300px';
      return el;
    },
    container: () => {
      const el = document.createElement('div');
      el.className = 'element';
      el.style.width = '300px';
      el.style.height = '200px';
      el.style.backgroundColor = '#f5f5f5';
      el.style.border = '1px solid #ddd';
      return el;
    }
  };
  
  // Add element buttons event listeners
  document.querySelectorAll('.element-button').forEach(button => {
    button.addEventListener('click', function() {
      const type = this.dataset.type;
      const creator = elementCreators[type];
      
      if (creator) {
        const element = creator();
        element.id = `element-${++elementCounter}`;
        element.style.left = '20px';
        element.style.top = '20px';
        
        // Add element events
        addElementEvents(element);
        
        // Add to canvas
        canvas.appendChild(element);
        
        // Select the new element
        selectElement(element);
      }
    });
  });
  
  function addElementEvents(element) {
    // Select on click
    element.addEventListener('mousedown', function(e) {
      if (e.target === element) {
        selectElement(element);
        
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = parseInt(element.style.left) || 0;
        startTop = parseInt(element.style.top) || 0;
        
        e.preventDefault();
      }
    });
    
    // Edit text on double click for text elements
    if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'BUTTON', 'SPAN', 'DIV'].includes(element.tagName)) {
      element.addEventListener('dblclick', function() {
        const currentText = element.innerText;
        const newText = prompt('Edit text:', currentText);
        if (newText !== null) {
          element.innerText = newText;
        }
      });
    }
  }
  
  // Handle mouse events for dragging
  document.addEventListener('mousemove', function(e) {
    if (isDragging && selectedElement) {
      const newLeft = startLeft + (e.clientX - startX);
      const newTop = startTop + (e.clientY - startY);
      
      selectedElement.style.left = `${newLeft}px`;
      selectedElement.style.top = `${newTop}px`;
    }
  });
  
  document.addEventListener('mouseup', function() {
    isDragging = false;
  });
  
  // Select element function
  function selectElement(element) {
    // Deselect current selection
    if (selectedElement) {
      selectedElement.classList.remove('selected');
    }
    
    // Select new element
    selectedElement = element;
    element.classList.add('selected');
    
    // Update properties panel
    updatePropertiesPanel();
  }
  
  // Update properties panel based on selected element
  function updatePropertiesPanel() {
    propertiesContent.innerHTML = '';
    
    if (!selectedElement) return;
    
    // Common properties
    addPropertyGroup('Position', [
      { name: 'left', label: 'Left (px)', type: 'number', value: parseInt(selectedElement.style.left) || 0 },
      { name: 'top', label: 'Top (px)', type: 'number', value: parseInt(selectedElement.style.top) || 0 }
    ]);
    
    addPropertyGroup('Size', [
      { name: 'width', label: 'Width (px)', type: 'number', value: parseInt(selectedElement.style.width) || 'auto' },
      { name: 'height', label: 'Height (px)', type: 'number', value: parseInt(selectedElement.style.height) || 'auto' }
    ]);
    
    // Style properties
    addPropertyGroup('Style', [
      { name: 'backgroundColor', label: 'Background Color', type: 'color', value: selectedElement.style.backgroundColor || '#ffffff' },
      { name: 'color', label: 'Text Color', type: 'color', value: selectedElement.style.color || '#000000' },
      { name: 'fontSize', label: 'Font Size (px)', type: 'number', value: parseInt(selectedElement.style.fontSize) || 16 },
      { name: 'padding', label: 'Padding (px)', type: 'number', value: parseInt(selectedElement.style.padding) || 0 }
    ]);
    
    // Element-specific properties
    if (selectedElement.tagName === 'IMG') {
      addPropertyGroup('Image', [
        { name: 'src', label: 'Image URL', type: 'text', value: selectedElement.src },
        { name: 'alt', label: 'Alt Text', type: 'text', value: selectedElement.alt }
      ]);
    }
  }
  
  function addPropertyGroup(title, properties) {
    const group = document.createElement('div');
    group.className = 'property-group';
    
    const groupTitle = document.createElement('h4');
    groupTitle.innerText = title;
    groupTitle.className = 'panel-title';
    group.appendChild(groupTitle);
    
    properties.forEach(prop => {
      const label = document.createElement('label');
      label.className = 'property-label';
      label.innerText = prop.label;
      group.appendChild(label);
      
      const input = document.createElement('input');
      input.className = prop.type === 'color' ? 'property-input color-picker' : 'property-input';
      input.type = prop.type;
      input.value = prop.value;
      
      input.addEventListener('change', function() {
        if (selectedElement) {
          if (prop.type === 'number') {
            selectedElement.style[prop.name] = `${this.value}px`;
          } else if (prop.name === 'src' || prop.name === 'alt') {
            selectedElement[prop.name] = this.value;
          } else {
            selectedElement.style[prop.name] = this.value;
          }
        }
      });
      
      group.appendChild(input);
    });
    
    propertiesContent.appendChild(group);
  }
  
  // New button
  newButton.addEventListener('click', function() {
    if (confirm('Clear all elements? This cannot be undone.')) {
      canvas.innerHTML = '';
      selectedElement = null;
      elementCounter = 0;
      updatePropertiesPanel();
    }
  });
  
  // Delete button
  deleteButton.addEventListener('click', function() {
    if (selectedElement && confirm('Delete selected element?')) {
      selectedElement.remove();
      selectedElement = null;
      updatePropertiesPanel();
    }
  });
  
  // Generate code
  codeButton.addEventListener('click', function() {
    const generatedHTML = generateHTML();
    codeOutput.value = generatedHTML;
    codeModal.style.display = 'flex';
  });
  
  // Close modal
  document.querySelector('.close-button').addEventListener('click', function() {
    codeModal.style.display = 'none';
  });
  
  // Copy code button
  copyCodeButton.addEventListener('click', function() {
    codeOutput.select();
    document.execCommand('copy');
    alert('Code copied to clipboard!');
  });
  
  // Generate HTML function
  function generateHTML() {
    const doctype = '<!DOCTYPE html>\n';
    const htmlOpen = '<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>My Website</title>\n  <style>\n    body {\n      margin: 0;\n      padding: 0;\n      font-family: Arial, sans-serif;\n    }\n  </style>\n</head>\n<body>\n';
    const htmlClose = '</body>\n</html>';
    
    let content = '  <div style="position: relative; width: 100%; max-width: 1024px; margin: 0 auto;">\n';
    
    // Clone canvas and process elements
    const elements = Array.from(canvas.children);
    
    elements.forEach(el => {
      const clone = el.cloneNode(true);
      
      // Remove element class and selected class
      clone.classList.remove('element', 'selected');
      
      // Convert to HTML string
      let styles = '';
      for (const prop of clone.style) {
        styles += `${prop}: ${clone.style[prop]}; `;
      }
      
      const tag = clone.tagName.toLowerCase();
      let elHtml = '';
      
      if (tag === 'img') {
        elHtml = `    <img src="${clone.src}" alt="${clone.alt}" style="${styles}">\n`;
      } else {
        elHtml = `    <${tag} style="${styles}">${clone.innerText}</${tag}>\n`;
      }
      
      content += elHtml;
    });
    
    content += '  </div>\n'; 
    
    return doctype + htmlOpen + content + htmlClose;
  }
  
  // Close modal when clicking outside
  window.addEventListener('click', function(e) {
    if (e.target === codeModal) {
      codeModal.style.display = 'none';
    }
  });
});
