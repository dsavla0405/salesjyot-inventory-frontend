import React from 'react';
import Barcode from 'react-barcode';

const Label = React.forwardRef(({ skuCode, MRP, description }, ref) => (
  <div
    ref={ref}
    style={{
      width: '52.5mm',
      height: '29.7mm',
      //border: '1px solid black',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'start',
      justifyContent: 'center',
      boxSizing: 'border-box',
      fontSize: '5pt',
      lineHeight: '1.2',
      marginLeft: '6px',
    }}
  >
    <h5 style={{ margin: '0', fontSize: '6pt', marginLeft: "6px"}}>Item: {skuCode}</h5>
    <p style={{ margin: '0px 0', fontSize: '6pt', marginLeft: "6px" }}>MRP: {MRP}</p>
    <p style={{ margin: '0px 0', fontSize: '6pt', marginLeft: "6px" }}>Description: {description}</p>
    <div style={{ width: '100%', textAlign: 'left', marginLeft: '6px'}}>
      <Barcode
        value={skuCode}
        width={1}
        height={15}
        fontSize={5}
        margin={0}
        displayValue={true}
      />
    </div>
  </div>
));

export default Label;
