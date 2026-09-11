import styled from 'styled-components/macro';
import { breakpoint } from '@/theme';
import tw from 'twin.macro';

const ContentContainer = styled.div`
    width: 100%;
    max-width: 1200px;
    box-sizing: border-box;
    ${tw`mx-auto px-3 py-3 sm:px-4 sm:py-4`};

    ${breakpoint('xl')`
        ${tw`px-4`};
    `};
`;
ContentContainer.displayName = 'ContentContainer';

export default ContentContainer;
