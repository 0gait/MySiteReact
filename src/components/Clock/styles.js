import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  font-family: Roboto Mono, Arial, sans-serif;
  text-align: center;
  color: inherit;
  height: 100%;
  margin: 0;
`;

export const Hr = styled.hr`
  border: 0;
  border-bottom: 2px solid #444;
`;

export const Text = styled.div`
  margin: 0;
  text-shadow: 0rem 0rem 8px rgba(255, 255, 255, 0.7),
    0rem 0rem 8px rgba(255, 255, 255, 0.3);
`;

export const Text2 = styled.div`
  display: flex;
`;

export const Text3 = styled.p`
  font-size: 2vw;
  margin: 0 0 2rem 0;
`;

export const Text4 = styled.h3`
  font-size: 9vw;
  font-weight: 300;
`;

export const Text5 = styled.h3`
  font-size: 6vw;
  font-weight: 100;
  margin-top: 2rem;
`;
