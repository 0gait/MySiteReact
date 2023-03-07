import styled from "styled-components";

export const Container1 = styled.div`
  width: 100%;
  aspect-ratio: 10 / 3;
  flex: 1;
  text-align: center;
  justify-content: center;
  align-content: center;
  margin-left: 1rem;
  position: relative;
`;

export const Container2 = styled.div`
  margin-left: 35px;
`;

export const Container3 = styled.div`
  position: absolute;
  margin-left: 35px;
  justify-content: center;
`;

export const Container4 = styled.div`
  width: 100%;
  margin-left: 35px;
  margin-top: 20px;
  justify-content: center;
  align-content: center;
  color: inherit;
`;

export const Container5 = styled.div`
  width: 100%;
  margin-left: 35px;
  margin-top: 20px;
  justify-content: center;
  align-content: center;
  color: inherit;
`;

// ----------------------------------------------------------------

export const Row1 = styled.div`
  padding: 40px;
  text-align: center;
  justify-content: center;
  align-content: center;
  margin-bottom: 25px;
`;

export const Row2 = styled.div`
  display: flex;
  margin-top: 24%;
`;

export const Row3 = styled.div`
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  justify-content: center;
  align-content: center;
`;

export const Row4 = styled.div`
  display: flex;
`;

export const Row2Col1 = styled.div`
  float: left;
`;

export const Row2Col2 = styled.div`
  float: left;
  width: 100%;
`;

export const Row2Col_50 = styled.div`
  float: left;
  width: 50%;
`;

// ----------------------------------------------------------------

export const Layer1 = styled.div`
  position: absolute;
  left: 0;
`;

export const Layer2 = styled.div`
  position: absolute;
  left: 20rem;
`;

// ----------------------------------------------------------------

export const Table1 = styled.table`
  width: 100%;
  text-align: left;
`;

export const TH1 = styled.th`
  font-weight: bold;
  width: 500px;
  height: 40px;
  font-size: 22px;
  color: #b3001b;
`;

export const TH2 = styled.th`
  font-weight: bold;
  width: 230px;
  height: 40px;
  font-size: 22px;
`;

export const TD1 = styled.td`
  font-size: 20px;
  padding: 12px;
`;

export const TD2 = styled.td`
  font-weight: bold;
  width: 500px;
  height: 40px;
  font-size: 22px;
  padding: 12px;
`;

// ----------------------------------------------------------------

export const List1 = styled.ol`
  width: 100%;
  height: 40px;
  font-size: 28px;
  margin-bottom: 8px;
  color: inherit;
  text-align: left;
  margin-left: -30px;
`;

export const LI1 = styled.li`
  font-weight: normal;
  font-size: 18px;
  padding: 8px;
  margin-left: 38px;
  color: ${({ theme }) => theme.text};
`;

export const LI2 = styled.li`
  font-weight: normal;
  font-size: 25px;
  padding: 8px;
  margin-top: 5px;
  margin-left: 14px;
  color: ${({ theme }) => theme.text};
  list-style: none;
`;

// ----------------------------------------------------------------

export const TitleText1 = styled.p`
  font-weight: bold;
  font-smooth: true;
  font-family: cursive;
  margin-bottom: 30px;
  font-size: 28px;
  background-color: rgb(15, 15, 15);
  padding: 10px;
  border-radius: 8px;
  background: ${({ theme }) => theme.bg};
`;

// ----------------------------------------------------------------

export const Link1 = styled.a`
  color: inherit;
  text-decoration: none;
  border-radius: 8px;
  :hover {
    box-shadow: inset 0 0 0 1px ${({ theme }) => theme.bg3};
    background: ${({ theme }) => theme.bg3};
  }
  padding: 12px;
`;

export const Link2 = styled.a`
  color: inherit;
  text-decoration: none;
  border-radius: 8px;
  :hover {
    box-shadow: inset 0 0 0 1px ${({ theme }) => theme.bg3};
    background: ${({ theme }) => theme.bg3};
  }
  padding: 8px;
  font-size: 16px;
`;

// ----------------------------------------------------------------

export const Image = styled.img``;
