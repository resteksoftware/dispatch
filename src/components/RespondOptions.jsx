import React from 'react';
import styled from 'styled-components';

const ResponseContainer = styled.div``;

const ResponseContent = styled.div`
display: grid;
grid-template-rows: 1fr 2fr 2fr;
grid-template-areas:'resptitle    '
                    'respsubtitle '
                    'respdirect   '
                    'respstation  ';
`;

const ResponseTitle = styled.div`
grid-area: resptitle;
display: flex;
justify-content: center;
font-size: 1.5em;
font-family: 'Podkova';
`;

const ResponseSubtitle = styled.div`
grid-area: respsubtitle;
text-align: center;
font-size: .75em;
font-family: 'Anonymous Pro';
display: flex;
align-items: center;
`;

const RespondDirect = styled.div`
grid-area: respdirect;
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
border: 2px solid firebrick;
border-radius: 10px;
margin: 5%;
font-family: 'Source Code Pro';
font-size: 1em;
text-align: center;
padding: 5px;
> div{
  font-family: 'Anonymous Pro';
  font-size: .8em;
  padding: 5px 0 5px 0;
  color: grey;
  font-style: italic;
}
`;

const RespondStation = styled.div`
grid-area: respstation;
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
border: 2px solid firebrick;
border-radius: 10px;
margin: 5%;
font-family: 'Source Code Pro';
font-size: 1em;
text-align: center;
padding: 5px;
> div {
  font-family: 'Anonymous Pro';
  font-size: .8em;
  padding: 5px 0 5px 0;
  color: grey;
  font-style: italic;
}
`;
const RespondOptions = (props) => {
  return (
    <ResponseContainer>
      <ResponseContent>
        <ResponseTitle>{props.resp.status}</ResponseTitle>
        <ResponseSubtitle>Select an option to respond to this call</ResponseSubtitle>
        <RespondDirect onClick={()=> props.handleResponse(true)}>
          Direct to Scene
            <br/>
          <div>(10 mins to scene)</div>
        </RespondDirect>
        <RespondStation>
          To Station First
            <br/>
          <div>(50 mins to scene)</div>
        </RespondStation>
      </ResponseContent>
    </ResponseContainer>
  )
}

export default RespondOptions
