import styled from "styled-components";

export const SHPContainer1 = styled.div`
  margin-top: 10px;
  text-align: center;
  justify-content: center;
  align-content: center;
  margin-left: 35px;
`;

export const SHPRow1 = styled.div`
  padding: 40px;
  text-align: center;
  justify-content: center;
  align-content: center;
  margin-bottom: 25px;
`;

export const SHPRow2 = styled.div`
  display: flex;
`;

export const SHPRow2Col1 = styled.div`
  float: left;
`;

export const SHPRow2Col2 = styled.div`
  float: left;
  width: 100%;
`;

export const SNPContainer1 = styled.div`
  margin-left: 35px;
`;

export const SDContainer1 = styled.div`
  position: absolute;
  margin-left: 35px;
  justify-content: center;
`;

export const SUPContainer = styled.div`
  width: 100%;
  margin-left: 35px;
  margin-top: 20px;
  justify-content: center;
  align-content: center;
  color: inherit;
`;

export const SUPTable1 = styled.table`
  width: 100%;
  text-align: left;
`;

export const SUPthVertical = styled.th`
  font-weight: bold;
  width: 500px;
  height: 40px;
  font-size: 22px;
  color: #b3001b;
`;

export const SUPtd = styled.td`
  font-size: 18px;
  padding: 12px;
`;

export const SUPList = styled.ol`
  width: 100%;
  height: 40px;
  font-size: 20px;
  margin-bottom: 8px;
  color: inherit;
  text-decoration: wavy underline;
  text-align: left;
  margin-left: -30px;
`;

export const SUPli = styled.li`
  font-weight: normal;
  font-size: 18px;
  padding: 10px;
  margin-left: 38px;
  text-decoration: none;
  color: ${({ theme }) => theme.text};
`;

export const SUPTitleText = styled.p`
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

export const SUPaTag = styled.a`
  color: inherit;
  text-decoration: none;
  border-radius: 8px;
  :hover {
    box-shadow: inset 0 0 0 1px ${({ theme }) => theme.bg3};
    background: ${({ theme }) => theme.bg3};
  }
  padding: 12px;
`;

export const SUPRow2 = styled.div`
  display: flex;
`;

export const SUPRow2Col1 = styled.div`
  float: left;
  width: 50%;
`;

export const SUPRow2Col2 = styled.div`
  float: left;
  width: 50%;
`;

export const Container = styled.div`
  width: 100%;
  margin-left: 35px;
  margin-top: 20px;
  justify-content: center;
  align-content: center;
  color: inherit;
`;

export const Table1 = styled.table`
  width: 100%;
  text-align: left;
`;

export const TitleText = styled.p`
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

export const Td = styled.td`
  font-weight: bold;
  width: 500px;
  height: 40px;
  font-size: 18px;
  padding: 12px;
`;

export const Links = styled.a`
  color: inherit;
  text-decoration: none;
  border-radius: 8px;
  :hover {
    box-shadow: inset 0 0 0 1px ${({ theme }) => theme.bg3};
    background: ${({ theme }) => theme.bg3};
  }
  padding: 12px;
`;
