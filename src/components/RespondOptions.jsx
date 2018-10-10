import React from 'react';
import styled from 'styled-components';

const ResponseContainer = styled.div`
  height: 100%;
`;

const ResponseContent = styled.div`
height: 100%;
display: grid;
grid-template-rows: 1fr 2fr;
grid-template-areas:'resptitle    '
                    'respdirect   '
                    'respstation  ';
`;

const ResponseTitle = styled.div`
grid-area: resptitle;
display: flex;
justify-content: center;
align-items: center;
font-size: 1.2rem;
text-align: center;
font-family: 'Zilla Slab', monospace;
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
max-height: 50px;
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

const ResponseMessage = styled.div`
  font-family: 'Source Code Pro', monospace;
`;




const ResponseButton = (props) => {
  if (props.respStatus === 'RESPOND') {
    return (
      <div>
        <RespondDirect onClick={() => props.handleResponse(props.isDirect)}>
          Direct to Scene
        </RespondDirect>
        <RespondStation>
          To Station First
        </RespondStation>
      </div>)
  } else if (props.respStatus === 'YOU ARE RESPONDING') {
    return (<CancelResponse onClick={() => props.handleEndResponse()}>
      Stop Responding
            </CancelResponse>)
  } else if (props.respStatus === 'YOU ARE RESPONDING TO ANOTHER INCIDENT') {
    return <ResponseMessage>Please end your existing response before responding to this incident</ResponseMessage>

  } else if (props.respStatus === 'YOU ALREADY RESPONDED') {
    return <ResponseMessage>Thank you for being awesome</ResponseMessage>
  }

}

const RespondOptions = (props) => {
  return (
    <ResponseContainer>
      <ResponseContent>
        <ResponseTitle>{props.responseStatus}</ResponseTitle>
        <ResponseButton
          respStatus={props.responseStatus}
          handleResponse={props.handleResponse}
          handleEndResponse={props.handleEndResponse}
          incId={props.incId}
          isDirect={true} />
      </ResponseContent>
    </ResponseContainer>
  )
}

export default RespondOptions

