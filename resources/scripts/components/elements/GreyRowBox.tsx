import styled from 'styled-components/macro';
import tw from 'twin.macro';

export default styled.div<{ $hoverable?: boolean }>`
    ${tw`flex rounded-lg no-underline items-center p-4 border border-transparent transition-colors duration-150 overflow-hidden`};
    background-color: #2b2d31;
    color: #dbdee1;

    ${(props) =>
        props.$hoverable !== false &&
        `
        &:hover {
            border-color: #5865F2;
            background-color: #35373c;
        }
    `};

    & .icon {
        ${tw`rounded-full w-16 h-16 flex items-center justify-center p-0 overflow-hidden`};
        background-color: #1e1f22;
        color: #b5bac1;
    }

    & .icon img {
        ${tw`w-full h-full object-cover`};
    }
`;
