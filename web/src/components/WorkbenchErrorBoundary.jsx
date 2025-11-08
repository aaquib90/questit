import { Component } from 'react';
import { Box, Button, Callout, Flex, Text } from '@radix-ui/themes';

class WorkbenchErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Workbench rendering error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ error: null });
    if (typeof this.props.onReset === 'function') {
      this.props.onReset();
    }
  };

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <Flex direction="column" align="center" justify="center" style={{ minHeight: '100vh' }}>
          <Box style={{ maxWidth: 520 }} px="4">
            <Callout.Root color="red" mb="4">
              <Callout.Text>
                {error?.message || 'Something went wrong while rendering the workbench.'}
              </Callout.Text>
              <Callout.Text size="2" color="gray">
                Check the console for details, adjust your prompt or edits, and try again.
              </Callout.Text>
            </Callout.Root>
            <Flex justify="center">
              <Button onClick={this.handleReset} highContrast>
                Reset Workbench
              </Button>
            </Flex>
          </Box>
        </Flex>
      );
    }
    return this.props.children;
  }
}

export default WorkbenchErrorBoundary;
