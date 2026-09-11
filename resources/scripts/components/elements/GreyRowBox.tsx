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
        ${tw`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full p-0 sm:h-16 sm:w-16`};
        background-color: #1e1f22;
        color: #b5bac1;
    }

    & .icon img {
        ${tw`w-full h-full object-cover`};
    }
`;
