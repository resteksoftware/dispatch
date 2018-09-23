import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

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

const CancelResponse = styled.div`
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

const GoToIncident = styled.div`
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


const ResponseButton = (props) => { 
  if (props.respStatus === 'RESPOND') {
    return (
    <div>  
      <RespondDirect onClick={() => props.handleResponse(props.isDirect)}>
        Direct to Scene
              <br />
        <div>(10 mins to scene)</div>
      </RespondDirect>
        <RespondStation>
          To Station First
              <br />
          <div>(50 mins to scene)</div>
        </RespondStation>
      </div>)
  } else if (props.respStatus === 'YOU ARE RESPONDING') {
    return (<CancelResponse onClick={() => props.handleEndResponse()}>
              Stop Responding
            </CancelResponse>)
  } else if (props.respStatus === 'YOU ARE RESPONDING TO ANOTHER INCIDENT') {
    return <div>Don't worry, everyone still likes you</div>

  } else if (props.respStatus === 'YOU ALREADY RESPONDED') {
    return <div>Don't worry, everyone still likes you</div>
  }
  
}

const RespondOptions = (props) => {
  return (
    <ResponseContainer>
      <ResponseContent>
        <ResponseTitle>{props.responseStatus}</ResponseTitle>
        <ResponseSubtitle>Select an option to respond to this call</ResponseSubtitle>
        <ResponseButton 
          respStatus={props.responseStatus} 
          handleResponse={props.handleResponse} 
          handleEndResponse={props.handleEndResponse}
          incId={props.incId}
          isDirect={true}/>
      </ResponseContent>
    </ResponseContainer>
  )
}

export default RespondOptions


